<script setup>
import { computed, ref } from "vue";
import PageHeader from "../components/PageHeader.vue";
import hunters from "../data/hunters.json";

const keyword = ref("");
const sortBy = ref("code");

const sortOptions = [
  { key: "random", label: "随机" },
  { key: "code-asc", label: "编号 ↑" },
  { key: "code-desc", label: "编号 ↓" },
];

let shuffleSeed = Math.random();

const list = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  let arr = hunters.filter(
    (h) =>
      !kw ||
      h.name.toLowerCase().includes(kw) ||
      (h.code || "").toLowerCase().includes(kw),
  );
  if (sortBy.value === "code-asc") {
    arr = [...arr].sort((a, b) => (a.code || "").localeCompare(b.code || ""));
  } else if (sortBy.value === "code-desc") {
    arr = [...arr].sort((a, b) => (b.code || "").localeCompare(a.code || ""));
  } else {
    arr = [...arr].sort((a, b) => {
      const ha = Math.sin(shuffleSeed * 99999 + a.name.charCodeAt(0));
      const hb = Math.sin(shuffleSeed * 99999 + b.name.charCodeAt(0));
      return ha - hb;
    });
  }
  return arr;
});

function shuffle() {
  shuffleSeed = Math.random();
  sortBy.value = "random";
}
</script>

<template>
  <div>
    <PageHeader :parts="['猎人', '档案库']" subtitle="点击猎人卡片访问 B 站主页" />

    <div class="container">
      <div class="toolbar">
        <div class="search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input v-model="keyword" type="search" placeholder="搜索猎人..." />
        </div>
        <div class="sort">
          <span class="sort-label">排序：</span>
          <button
            v-for="opt in sortOptions"
            :key="opt.key"
            type="button"
            class="sort-btn"
            :class="{ active: sortBy === opt.key }"
            @click="opt.key === 'random' ? shuffle() : (sortBy = opt.key)"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <div class="hunter-grid">
        <a
          v-for="h in list"
          :key="h.id"
          :href="h.bilibili_link"
          target="_blank"
          rel="noopener noreferrer"
          class="hunter-card hover-lift"
        >
          <img class="avatar" :src="h.avatar" :alt="h.name" loading="lazy" />
          <h3>{{ h.name }}</h3>
          <p class="code">{{ h.code }}</p>
        </a>
      </div>

      <p v-if="list.length === 0" class="empty-tip">没有找到匹配的猎人</p>
    </div>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 36px;
}

.search {
  position: relative;
  flex: 1;
  max-width: 340px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: var(--text-dim);
  pointer-events: none;
}

.search input {
  width: 100%;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text);
  padding: 11px 14px 11px 40px;
  font-size: 0.92rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s ease;
}

.search input:focus {
  border-color: var(--red);
}

.search input::placeholder {
  color: var(--text-dim);
}

.sort {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-label {
  color: var(--text-dim);
  font-size: 0.88rem;
}

.sort-btn {
  padding: 8px 16px;
  border-radius: 9px;
  background: var(--card);
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.sort-btn:hover {
  color: #fff;
  border-color: var(--red);
}

.sort-btn.active {
  background: var(--red);
  border-color: var(--red);
  color: #fff;
}

.hunter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  padding-bottom: 96px;
}

.hunter-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 30px 18px;
  text-align: center;
  display: block;
}

.avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--red);
  margin: 0 auto 16px;
}

.hunter-card h3 {
  color: #fff;
  font-size: 1.08rem;
  margin-bottom: 8px;
}

.code {
  color: var(--red);
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 1px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
</style>
