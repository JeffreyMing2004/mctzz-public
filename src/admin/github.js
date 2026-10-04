// GitHub Contents API 读写：后台的数据文件直接以提交形式写回仓库。
// 公开仓库可免令牌只读加载；保存需要具备 Contents 读写权限的令牌。
const API = "https://api.github.com";

export function toBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

export function fromBase64(b64) {
  const bin = atob((b64 || "").replace(/\s/g, ""));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function headers(token) {
  const h = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

async function unwrap(res) {
  if (res.ok) return res.json();
  let msg = `HTTP ${res.status}`;
  try {
    const body = await res.json();
    if (body.message) msg = body.message;
  } catch {
    /* 忽略非 JSON 错误体 */
  }
  if (res.status === 401) msg = "令牌无效或已过期（401）";
  if (res.status === 403)
    msg = "权限不足或触发限流（403）：令牌需要该仓库的 Contents 读写权限";
  if (res.status === 404) msg = "文件或仓库不存在（404）";
  if (res.status === 409) msg = "远端已有新提交，请刷新后重试（409）";
  const err = new Error(msg);
  err.status = res.status;
  throw err;
}

export async function loadFile({ owner, repo, branch, path, token }) {
  const url = `${API}/repos/${owner}/${repo}/contents/${path}?ref=${encodeURIComponent(branch)}`;
  const res = await fetch(url, { headers: headers(token) });
  const body = await unwrap(res);
  return {
    sha: body.sha,
    text: fromBase64(body.content),
  };
}

export async function saveFile({
  owner,
  repo,
  branch,
  path,
  token,
  sha,
  content,
  message,
}) {
  const url = `${API}/repos/${owner}/${repo}/contents/${path}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: headers(token),
    body: JSON.stringify({
      message,
      content: toBase64(content),
      sha,
      branch,
    }),
  });
  const body = await unwrap(res);
  return { sha: body.content?.sha };
}

export async function validateToken(token) {
  const res = await fetch(`${API}/user`, { headers: headers(token) });
  const body = await unwrap(res);
  return body.login;
}
