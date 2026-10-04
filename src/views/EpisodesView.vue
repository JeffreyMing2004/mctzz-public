<script setup>
import { computed, ref } from "vue";
import PageHeader from "../components/PageHeader.vue";
import episodes from "../data/episodes.json";
import mainCategories from "../data/episode_main_categories.json";
import subCategories from "../data/episode_sub_categories.json";

const activeCategory = ref("all");

const categoryNames = Object.fromEntries(
  mainCategories.map((c) => [c.id, c.name]),
);
const subNames = Object.fromEntries(subCategories.map((c) => [c.id, c.name]));

const filtered = computed(() =>
  activeCategory.value === "all"
    ? episodes
    : episodes.filter((e) => e.main_category_id === activeCategory.value),
);
</script>

<template>
  <div>
    <PageHeader :parts="['往期', '内容']" subtitle="回顾每一期的精彩瞬间，找到你想重温的节目" />

    <div class="container">
      <div class="filter-bar">
        <button
          type="button"
          class="filter-btn"
          :class="{ active: activeCategory === 'all' }"
          @click="activeCategory = 'all'"
        >
          全部
        </button>
        <button
          v-for="cat in mainCategories"
          :key="cat.id"
          type="button"
          class="filter-btn"
          :class="{ active: activeCategory === cat.id }"
          @click="activeCategory = cat.id"
        >
          {{ cat.name }}
        </button>
      </div>

      <div class="episode-grid">
        <a
          v-for="ep in filtered"
          :key="ep.id"
          :href="ep.bilibili_link"
          target="_blank"
          rel="noopener noreferrer"
          class="episode-card hover-lift"
        >
          <div class="cover">
            <img :src="ep.cover_image" :alt="ep.title" loading="lazy" />
            <span v-if="ep.status === '热播中'" class="status hot">
              {{ ep.status }}
            </span>
          </div>
          <div class="body">
            <h3>{{ ep.title }}</h3>
            <p class="desc">{{ ep.description }}</p>
            <div class="meta">
              <span class="meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="meta-icon">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                {{ ep.air_date }}
              </span>
              <span class="meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="meta-icon">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                </svg>
                {{ ep.player_count }}人
              </span>
              <span class="meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="meta-icon">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                {{ ep.duration_minutes }}分钟
              </span>
            </div>
          </div>
          <span class="sr-only">{{ categoryNames[ep.main_category_id] }} {{ subNames[ep.sub_category_id] }}</span>
        </a>
      </div>

      <p v-if="filtered.length === 0" class="empty-tip">暂无相关内容</p>
    </div>
  </div>
</template>

<style scoped>
.episode-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  padding-bottom: 80px;
}

.episode-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.cover {
  position: relative;
  aspect-ratio: 16 / 9;
  background: #000;
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status {
  position: absolute;
  top: 12px;
  right: 12px;
  background: var(--card-2);
  color: #fff;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 12px;
  border-radius: 999px;
}

.status.hot {
  background: var(--red);
}

.body {
  padding: 18px 20px 20px;
}

.body h3 {
  color: #fff;
  font-size: 1.08rem;
  margin-bottom: 8px;
}

.desc {
  color: var(--text-dim);
  font-size: 0.88rem;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: auto;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--text-muted);
  font-size: 0.8rem;
}

.meta-icon {
  width: 14px;
  height: 14px;
  color: var(--red);
  flex-shrink: 0;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
</style>
