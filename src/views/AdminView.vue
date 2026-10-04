<script setup>
import { computed, onBeforeUnmount, reactive, ref } from "vue";
import { loadFile, saveFile, validateToken } from "../admin/github";
import { COLLECTIONS, REPO_DEFAULT } from "../admin/schema";

const LS_KEY = "mctzz_admin_config";

const config = reactive({
  ...REPO_DEFAULT,
  token: sessionStorage.getItem("mctzz_admin_token") || "",
  remember: sessionStorage.getItem("mctzz_admin_token") !== "",
});
try {
  const saved = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  if (saved.owner) Object.assign(config, saved);
} catch {
  /* 忽略损坏的本地配置 */
}

const loading = ref(false);
const loadError = ref("");
const loaded = ref(false);
const failedFiles = ref([]); // 加载失败的集合（如远端尚无该文件）
const store = reactive({}); // key -> { rows, sha }
const dirty = reactive({}); // key -> true
const activeKey = ref(COLLECTIONS[0].key);
const editing = ref(null); // { isNew, index, model }
const pushing = ref(false);
const pushLog = ref([]);
const tokenUser = ref("");

const activeCol = computed(
  () => COLLECTIONS.find((c) => c.key === activeKey.value),
);
const dirtyFiles = computed(() =>
  COLLECTIONS.filter((c) => dirty[c.key]).map((c) => c.label),
);
const hasDirty = computed(() => dirtyFiles.value.length > 0);

function persistConfig() {
  const { owner, repo, branch } = config;
  localStorage.setItem(LS_KEY, JSON.stringify({ owner, repo, branch }));
  if (config.token && config.remember) {
    sessionStorage.setItem("mctzz_admin_token", config.token);
  } else {
    sessionStorage.removeItem("mctzz_admin_token");
  }
}

function markDirty(key) {
  dirty[key] = true;
}

async function loadAll() {
  loading.value = true;
  loadError.value = "";
  failedFiles.value = [];
  persistConfig();
  const errors = [];
  for (const col of COLLECTIONS) {
    try {
      const { sha, text } = await loadFile({
        owner: config.owner,
        repo: config.repo,
        branch: config.branch,
        path: col.file,
        token: config.token || undefined,
      });
      store[col.key] = { rows: JSON.parse(text), sha };
      delete dirty[col.key];
    } catch (e) {
      errors.push(`${col.label}（${col.file}）：${e.message}`);
      failedFiles.value.push(col.key);
      delete dirty[col.key];
    }
  }
  loaded.value = true;
  if (errors.length) loadError.value = errors.join("；");
  loading.value = false;
}

async function checkToken() {
  pushLog.value = [];
  try {
    tokenUser.value = await validateToken(config.token);
    pushLog.value.push(`✔ 令牌有效，账号：${tokenUser.value}`);
  } catch (e) {
    tokenUser.value = "";
    pushLog.value.push(`✘ ${e.message}`);
  }
}

const rows = computed(() => store[activeKey.value]?.rows ?? []);

function resolveRef(field, value) {
  if (!field.ref) return value;
  const refRows = store[field.ref.file]?.rows ?? [];
  const hit = refRows.find((r) => r[field.ref.valueKey] === value);
  return hit ? hit[field.ref.labelKey] : value || "—";
}

function cellText(col, row, key) {
  const field = col.fields.find((f) => f.key === key);
  let v = row[key];
  if (field?.ref) return resolveRef(field, v);
  if (Array.isArray(v)) return v.join(" / ");
  if (v === undefined || v === null || v === "") return "—";
  return String(v);
}

function refOptions(field) {
  const refRows = store[field.ref.file]?.rows ?? [];
  return refRows.map((r) => ({
    value: r[field.ref.valueKey],
    label: r[field.ref.labelKey],
  }));
}

function openEdit(index) {
  const col = activeCol.value;
  const isNew = index === null;
  const source = isNew ? {} : rows.value[index];
  const model = {};
  for (const f of col.fields) {
    const v = source[f.key];
    model[f.key] =
      f.type === "lines"
        ? Array.isArray(v)
          ? v.join("\n")
          : ""
        : v === undefined || v === null
          ? ""
          : v;
  }
  editing.value = { isNew, index, model };
}

function closeEdit() {
  editing.value = null;
}

function formError(col, model) {
  for (const f of col.fields) {
    if (f.readonly) continue;
    const v = model[f.key];
    if (f.required && (v === "" || v === null || v === undefined)) {
      return `「${f.label}」不能为空`;
    }
    if (f.type === "number" && v !== "" && Number.isNaN(Number(v))) {
      return `「${f.label}」必须是数字`;
    }
  }
  return "";
}

function saveRecord() {
  const col = activeCol.value;
  const err = formError(col, editing.value.model);
  if (err) {
    editing.value.error = err;
    return;
  }
  const record = {};
  for (const f of col.fields) {
    let v = editing.value.model[f.key];
    if (f.type === "number") v = v === "" ? 0 : Number(v);
    else if (f.type === "lines")
      v = String(v)
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
    record[f.key] = v;
  }
  if (col.hasId && !record.id) {
    record.id = crypto.randomUUID();
  }
  if (col.key === "memes" && record.category) {
    const cat = (store.meme_categories?.rows ?? []).find(
      (c) => c.name === record.category,
    );
    if (cat) record.category_id = cat.id;
  }
  if (editing.value.isNew) {
    store[col.key].rows.push(record);
  } else {
    store[col.key].rows.splice(editing.value.index, 1, record);
  }
  markDirty(col.key);
  editing.value = null;
}

function removeRecord(index) {
  const col = activeCol.value;
  const label = rows.value[index]?.title ?? rows.value[index]?.name ?? "该记录";
  if (!confirm(`确认删除「${label}」？推送后生效。`)) return;
  store[col.key].rows.splice(index, 1);
  markDirty(col.key);
}

async function pushAll() {
  if (!config.token) {
    pushLog.value = ["✘ 保存需要 GitHub 令牌（Contents 读写权限），请在上方填写"];
    return;
  }
  pushing.value = true;
  pushLog.value = [];
  for (const col of COLLECTIONS) {
    if (!dirty[col.key]) continue;
    pushLog.value.push(`→ 正在提交 ${col.file} …`);
    try {
      const { sha } = await saveFile({
        owner: config.owner,
        repo: config.repo,
        branch: config.branch,
        path: col.file,
        token: config.token,
        sha: store[col.key].sha,
        content: JSON.stringify(store[col.key].rows, null, 2) + "\n",
        message: `后台更新: ${col.file}`,
      });
      store[col.key].sha = sha;
      delete dirty[col.key];
      pushLog.value.push(`✔ 已提交 ${col.file}`);
    } catch (e) {
      pushLog.value.push(`✘ ${col.file}：${e.message}`);
    }
  }
  pushLog.value.push(
    "完成。站点数据在下次部署构建后生效（若仓库配置了 push 自动部署则会自动更新）。",
  );
  pushing.value = false;
}

async function discardAll() {
  if (!confirm("放弃全部未推送的修改，并从仓库重新加载？")) return;
  await loadAll();
  pushLog.value = [];
}

function onBeforeUnload(e) {
  if (hasDirty.value) {
    e.preventDefault();
    e.returnValue = "";
  }
}
window.addEventListener("beforeunload", onBeforeUnload);
onBeforeUnmount(() => window.removeEventListener("beforeunload", onBeforeUnload));
</script>

<template>
  <div class="admin">
    <div class="container">
      <div class="admin-head">
        <h1>资料站<span class="accent">后台</span></h1>
        <p class="sub">
          数据保存在仓库 JSON 文件中：编辑后推送到 GitHub，站点重新部署后生效。
          <router-link to="/" class="back">← 返回前台</router-link>
        </p>
      </div>

      <!-- 仓库与令牌配置 -->
      <section class="panel">
        <h2>1 · 仓库与令牌</h2>
        <div class="config-grid">
          <label>
            仓库拥有者
            <input v-model="config.owner" type="text" />
          </label>
          <label>
            仓库名
            <input v-model="config.repo" type="text" />
          </label>
          <label>
            分支
            <input v-model="config.branch" type="text" />
          </label>
          <label class="token-field">
            GitHub 令牌（仅保存需要；公开仓库可先只读加载）
            <input
              v-model="config.token"
              type="password"
              placeholder="ghp_… / github_pat_…"
              autocomplete="off"
            />
          </label>
        </div>
        <div class="config-actions">
          <button type="button" class="btn solid" :disabled="loading" @click="loadAll">
            {{ loading ? "加载中…" : loaded ? "重新加载仓库数据" : "加载数据" }}
          </button>
          <button
            type="button"
            class="btn ghost"
            :disabled="!config.token"
            @click="checkToken"
          >
            验证令牌
          </button>
          <label class="remember">
            <input v-model="config.remember" type="checkbox" />
            本次会话记住令牌
          </label>
        </div>
        <p v-if="tokenUser" class="hint ok">当前令牌账号：{{ tokenUser }}</p>
        <p v-if="loadError" class="hint err">加载失败：{{ loadError }}</p>
      </section>

      <template v-if="loaded">
        <!-- 数据集切换 -->
        <section class="panel">
          <h2>2 · 选择数据集</h2>
          <div class="tabs">
            <button
              v-for="col in COLLECTIONS"
              :key="col.key"
              type="button"
              class="tab"
              :class="{ active: activeKey === col.key, dirty: dirty[col.key] }"
              @click="activeKey = col.key"
            >
              {{ col.label }}
              <span v-if="dirty[col.key]" class="dot" title="有未推送修改"></span>
            </button>
          </div>
        </section>

        <!-- 记录列表 -->
        <section class="panel">
          <div class="list-head">
            <h2>3 · {{ activeCol.label }}（{{ rows.length }} 条）</h2>
            <button
              type="button"
              class="btn solid"
              :disabled="failedFiles.includes(activeKey)"
              @click="openEdit(null)"
            >
              + 新增
            </button>
          </div>
          <p v-if="failedFiles.includes(activeKey)" class="hint err">
            该数据集加载失败（远端文件不存在或无权限），请检查令牌或先推送该文件。
          </p>
          <div v-else class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th v-for="key in activeCol.list" :key="key">
                    {{ activeCol.fields.find((f) => f.key === key)?.label ?? key }}
                  </th>
                  <th class="ops">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in rows" :key="row.id ?? i">
                  <td class="idx">{{ i + 1 }}</td>
                  <td v-for="key in activeCol.list" :key="key" class="cell">
                    {{ cellText(activeCol, row, key) }}
                  </td>
                  <td class="ops">
                    <button type="button" class="mini" @click="openEdit(i)">编辑</button>
                    <button type="button" class="mini danger" @click="removeRecord(i)">
                      删除
                    </button>
                  </td>
                </tr>
                <tr v-if="rows.length === 0">
                  <td :colspan="activeCol.list.length + 2" class="none">暂无数据</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- 推送 -->
        <section class="panel push-panel">
          <h2>4 · 推送到 GitHub</h2>
          <p class="push-state">
            <template v-if="hasDirty">
              待推送：<strong>{{ dirtyFiles.join("、") }}</strong>
            </template>
            <template v-else>所有修改均已推送 ✔</template>
          </p>
          <div class="push-actions">
            <button
              type="button"
              class="btn solid"
              :disabled="!hasDirty || pushing"
              @click="pushAll"
            >
              {{ pushing ? "推送中…" : `推送 ${dirtyFiles.length} 个文件` }}
            </button>
            <button
              type="button"
              class="btn ghost"
              :disabled="pushing"
              @click="discardAll"
            >
              放弃修改并重载
            </button>
          </div>
          <pre v-if="pushLog.length" class="log">{{ pushLog.join("\n") }}</pre>
        </section>
      </template>

      <!-- 编辑弹窗 -->
      <div v-if="editing" class="modal-mask" @click.self="closeEdit">
        <div class="modal">
          <div class="modal-head">
            <h3>{{ editing.isNew ? "新增" : "编辑" }} · {{ activeCol.label }}</h3>
            <button type="button" class="close" @click="closeEdit">✕</button>
          </div>
          <p v-if="editing.error" class="hint err">{{ editing.error }}</p>
          <div class="form">
            <label v-for="f in activeCol.fields" :key="f.key" class="field">
              <span class="field-label">
                {{ f.label }}
                <em v-if="f.required">*</em>
              </span>
              <select
                v-if="f.type === 'select' && f.ref"
                v-model="editing.model[f.key]"
              >
                <option value="">（未选择）</option>
                <option v-for="o in refOptions(f)" :key="o.value" :value="o.value">
                  {{ o.label }}
                </option>
              </select>
              <select
                v-else-if="f.type === 'select'"
                v-model="editing.model[f.key]"
              >
                <option value="">（未选择）</option>
                <option v-for="o in f.options" :key="o" :value="o">{{ o }}</option>
              </select>
              <textarea
                v-else-if="f.type === 'textarea' || f.type === 'lines'"
                v-model="editing.model[f.key]"
                :rows="f.type === 'lines' ? 6 : 3"
                :placeholder="f.placeholder"
              ></textarea>
              <input
                v-else
                v-model="editing.model[f.key]"
                :type="f.type === 'number' ? 'number' : 'text'"
                :placeholder="f.placeholder"
                :disabled="f.readonly"
              />
            </label>
          </div>
          <div class="modal-foot">
            <button type="button" class="btn ghost" @click="closeEdit">取消</button>
            <button type="button" class="btn solid" @click="saveRecord">保存到本地草稿</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin {
  min-height: 100%;
  padding: 40px 0 96px;
}

.admin-head {
  text-align: center;
  margin-bottom: 32px;
}

.admin-head h1 {
  color: #fff;
  font-size: 2rem;
  font-weight: 800;
}

.accent {
  color: var(--red);
}

.sub {
  color: var(--text-dim);
  font-size: 0.9rem;
  margin-top: 8px;
}

.back {
  color: var(--red);
  margin-left: 8px;
}

.panel {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 22px 24px;
  margin-bottom: 20px;
}

.panel h2 {
  color: #fff;
  font-size: 1.05rem;
  margin-bottom: 16px;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: var(--text-muted);
  font-size: 0.82rem;
}

.token-field {
  grid-column: 1 / -1;
}

input[type="text"],
input[type="password"],
input[type="number"],
select,
textarea {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 9px;
  color: var(--text);
  padding: 9px 12px;
  font-size: 0.9rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s ease;
  width: 100%;
}

input:focus,
select:focus,
textarea:focus {
  border-color: var(--red);
}

textarea {
  resize: vertical;
}

.remember {
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.config-actions,
.push-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
}

.btn {
  padding: 10px 22px;
  border-radius: 9px;
  font-weight: 700;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.btn.solid {
  background: var(--red);
  color: #fff;
}

.btn.solid:hover:not(:disabled) {
  background: var(--red-dark);
}

.btn.ghost {
  background: var(--card-2);
  color: var(--text-muted);
}

.btn.ghost:hover:not(:disabled) {
  color: #fff;
  border-color: var(--red);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.hint {
  margin-top: 12px;
  font-size: 0.85rem;
}

.hint.ok {
  color: #4ade80;
}

.hint.err {
  color: var(--red);
}

.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tab {
  padding: 9px 18px;
  border-radius: 9px;
  background: var(--bg);
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 0.88rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  transition: all 0.2s ease;
}

.tab:hover {
  color: #fff;
  border-color: var(--red);
}

.tab.active {
  background: var(--red);
  border-color: var(--red);
  color: #fff;
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--gold);
}

.list-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.86rem;
}

th,
td {
  text-align: left;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(204, 0, 0, 0.15);
}

th {
  color: var(--text-dim);
  font-weight: 600;
  white-space: nowrap;
}

td.cell {
  color: var(--text-muted);
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

td.idx {
  color: var(--text-dim);
  width: 40px;
}

td.ops {
  white-space: nowrap;
}

td.none {
  text-align: center;
  color: var(--text-dim);
  padding: 32px 0;
}

.mini {
  padding: 5px 12px;
  border-radius: 7px;
  background: var(--bg);
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 0.78rem;
  transition: all 0.2s ease;
}

.mini:hover {
  color: #fff;
  border-color: var(--red);
}

.mini.danger:hover {
  background: var(--red);
  border-color: var(--red);
  color: #fff;
}

.push-state {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.push-state strong {
  color: var(--gold);
}

.log {
  margin-top: 14px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 9px;
  padding: 12px 14px;
  color: var(--text-muted);
  font-size: 0.78rem;
  font-family: ui-monospace, Consolas, monospace;
  white-space: pre-wrap;
  max-height: 220px;
  overflow-y: auto;
}

.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal {
  width: 100%;
  max-width: 620px;
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  background: var(--card);
  border: 1px solid var(--red-soft);
  border-radius: 14px;
  padding: 22px 24px;
  animation: modal-in 0.25s ease both;
}

@keyframes modal-in {
  from {
    opacity: 0;
    transform: scale(0.94);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.modal-head h3 {
  color: #fff;
  font-size: 1.1rem;
}

.close {
  color: var(--text-dim);
  font-size: 1rem;
}

.close:hover {
  color: var(--red);
}

.form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.field:nth-child(n + 1):has(textarea) {
  grid-column: 1 / -1;
}

.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

@media (max-width: 640px) {
  .form {
    grid-template-columns: 1fr;
  }
}
</style>
