<script setup>
import { computed, ref } from "vue";
import PageHeader from "../components/PageHeader.vue";
import players from "../data/players.json";

const keyword = ref("");
const sortBy = ref("random");
let shuffleSeed = Math.random();

const sortOptions = [
  { key: "random", label: "随机" },
  { key: "episodes-desc", label: "参赛次数 ↓" },
  { key: "episodes-asc", label: "参赛次数 ↑" },
];

function shuffleKey() {
  // 每次点击“随机”换一个打乱种子
  shuffleSeed = Math.random();
  return sortBy.value;
}

const list = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  let arr = players.filter(
    (p) => !kw || p.name.toLowerCase().includes(kw),
  );
  if (sortBy.value === "episodes-desc") {
    arr = [...arr].sort((a, b) => b.episodes - a.episodes);
  } else if (sortBy.value === "episodes-asc") {
    arr = [...arr].sort((a, b) => a.episodes - b.episodes);
  } else {
    arr = [...arr].sort((a, b) => {
      const ha = Math.sin(shuffleSeed * 99999 + a.name.charCodeAt(0));
      const hb = Math.sin(shuffleSeed * 99999 + b.name.charCodeAt(0));
      return ha - hb;
    });
  }
  return arr;
});
</script>

<template>
  <div>
    <PageHeader :parts="['玩家', '档案库']" subtitle="了解每位玩家的参赛历史、表现数据和个人特色" />

    <div class="container">
      <div class="toolbar">
        <div class="search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input v-model="keyword" type="search" placeholder="搜索玩家..." />
        </div>
        <div class="sort">
          <span class="sort-label">排序：</span>
          <button
            v-for="opt in sortOptions"
            :key="opt.key"
            type="button"
            class="sort-btn"
            :class="{ active: sortBy === opt.key }"
            @click="opt.key === 'random' ? (sortBy = shuffleKey()) : (sortBy = opt.key)"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <div class="player-grid">
        <component
          :is="p.bilibili_link ? 'a' : 'div'"
          v-for="p in list"
          :key="p.id"
          :href="p.bilibili_link || undefined"
          :target="p.bilibili_link ? '_blank' : undefined"
          :rel="p.bilibili_link ? 'noopener noreferrer' : undefined"
          class="player-card hover-lift"
        >
          <img class="avatar" :src="p.avatar" :alt="p.name" loading="lazy" />
          <h3>{{ p.name }}</h3>
          <div class="tags">
            <span class="gender" :class="p.gender === '女' ? 'female' : 'male'">
              {{ p.gender }}
            </span>
            <span class="count">参赛 {{ p.episodes }} 期</span>
          </div>
          <p class="platform">{{ p.declaration }}</p>
        </component>
      </div>

      <p v-if="list.length === 0" class="empty-tip">没有找到匹配的玩家</p>
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

.player-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  padding-bottom: 96px;
}

.player-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 24px 18px;
  text-align: center;
  display: block;
}

.avatar {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--red-soft);
  margin: 0 auto 14px;
}

.player-card h3 {
  color: #fff;
  font-size: 1rem;
  margin-bottom: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tags {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 10px;
}

.gender {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 999px;
}

.gender.male {
  background: rgba(0, 102, 255, 0.15);
  color: #66a3ff;
}

.gender.female {
  background: rgba(255, 0, 128, 0.15);
  color: #ff66a3;
}

.count {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 999px;
  background: var(--card-2);
  color: var(--text-muted);
}

.platform {
  color: var(--text-dim);
  font-size: 0.8rem;
}
</style>
