// 一次性数据准备脚本：下载远端图片素材到 public/images，并把 JSON 数据
// 中的图片地址改写为本地路径、剔除后台管理字段。运行：node scripts/prepare-data.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dataDir = path.join(root, "src", "data");
const imgRoot = path.join(root, "public", "images");

const CDN_HOST = "material-image.wanwang.xin";

function localName(url) {
  const u = new URL(url);
  const seg = u.pathname.split("/").filter(Boolean).pop() ?? "";
  const ext = path.extname(seg) || ".png";
  const base = path.basename(seg, path.extname(seg));
  return `${base}${ext}`;
}

async function download(url, dest, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, {
        headers: { Referer: "https://www.mctzz.com/", "User-Agent": "Mozilla/5.0" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, buf);
      return buf.length;
    } catch (e) {
      if (i === tries - 1) throw new Error(`下载失败 ${url}: ${e.message}`);
      await new Promise(r => setTimeout(r, 800 * (i + 1)));
    }
  }
}

const tables = ["episodes", "players", "bilibili_videos", "hunters", "memes",
  "meme_categories", "episode_main_categories", "episode_sub_categories",
  "episode_links", "rankings"];

const strip = new Set(["is_deleted", "created_at", "updated_at"]);
const kinds = { episodes: "covers", players: "avatars", bilibili_videos: "videos", hunters: "avatars" };
const fieldMap = { episodes: "cover_image", players: "avatar", bilibili_videos: "cover_image_url", hunters: "avatar" };

const queue = [];
for (const t of tables) {
  const file = path.join(dataDir, `${t}.json`);
  const rows = JSON.parse(fs.readFileSync(file, "utf8"));
  const cleaned = rows.map(r => {
    const o = {};
    for (const [k, v] of Object.entries(r)) {
      if (strip.has(k)) continue;
      o[k] = v;
    }
    return o;
  });
  const kind = kinds[t];
  const field = fieldMap[t];
  if (kind) {
    for (const o of cleaned) {
      const url = o[field];
      if (typeof url === "string" && url.includes(CDN_HOST)) {
        const name = localName(url);
        o[field] = `/images/${kind}/${name}`;
        queue.push({ url, dest: path.join(imgRoot, kind, name) });
      }
    }
  }
  fs.writeFileSync(file, JSON.stringify(cleaned, null, 2));
}

// 品牌/静态资源
const brand = [
  { url: "https://material-image.wanwang.xin/1815348553295274/public/3256e20e-63ea-4be1-91a5-c1036a200ec0.png", dest: path.join(imgRoot, "brand", "logo.png") },
  { url: "https://material-image.wanwang.xin/1815348553295274/public/964bed4b-5442-4747-9ad8-e59636965cd0.png", dest: path.join(imgRoot, "brand", "hero-logo.png") },
  { url: "https://material-image.wanwang.xin/1815348553295274/WS20260506172711000001/867782b7-5567-4103-89dd-89217bb7a4ce.png", dest: path.join(root, "public", "favicon.png") },
];
queue.push(...brand);

const unique = new Map();
for (const q of queue) if (!unique.has(q.dest)) unique.set(q.dest, q);

let done = 0, failed = 0, bytes = 0;
const failures = [];
for (const { url, dest } of unique.values()) {
  try {
    bytes += await download(url, dest);
    done++;
    if (done % 20 === 0) console.log(`已下载 ${done}/${unique.size}`);
  } catch (e) {
    failed++;
    failures.push(e.message);
  }
}
console.log(`完成：${done} 张，共 ${(bytes / 1024 / 1024).toFixed(1)} MB，失败 ${failed}`);
if (failures.length) console.log(failures.join("\n"));
