<script setup>
import { computed, ref } from "vue";
import PageHeader from "../components/PageHeader.vue";
import memes from "../data/memes.json";
import memeCategories from "../data/meme_categories.json";

const activeCategory = ref("all");

const filtered = computed(() =>
  activeCategory.value === "all"
    ? memes
    : memes.filter((m) => m.category === activeCategory.value),
);
</script>

<template>
  <div>
    <PageHeader :parts="['梗', '百科']" subtitle="回顾那些让人印象深刻的经典瞬间和名场面" />

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
          v-for="cat in memeCategories"
          :key="cat.id"
          type="button"
          class="filter-btn"
          :class="{ active: activeCategory === cat.name }"
          @click="activeCategory = cat.name"
        >
          {{ cat.name }}
        </button>
      </div>

      <div class="meme-grid">
        <a
          v-for="meme in filtered"
          :key="meme.id"
          :href="meme.bilibili_link"
          target="_blank"
          rel="noopener noreferrer"
          class="meme-card hover-lift"
        >
          <span class="badge">{{ meme.category }}</span>
          <h3>{{ meme.title }}</h3>
          <p class="desc">{{ meme.description }}</p>
          <span class="from">出自 {{ meme.episode }}</span>
        </a>
      </div>

      <p v-if="filtered.length === 0" class="empty-tip">暂无相关内容</p>
    </div>
  </div>
</template>

<style scoped>
.meme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  padding-bottom: 96px;
}

.meme-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 26px 24px;
  display: flex;
  flex-direction: column;
}

.badge {
  align-self: flex-start;
  background: rgba(255, 0, 0, 0.12);
  border: 1px solid var(--red-soft);
  color: var(--red);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 12px;
  border-radius: 999px;
  margin-bottom: 16px;
}

.meme-card h3 {
  color: #fff;
  font-size: 1.12rem;
  margin-bottom: 12px;
}

.desc {
  color: var(--text-muted);
  font-size: 0.9rem;
  white-space: pre-line;
  margin-bottom: 18px;
}

.from {
  margin-top: auto;
  align-self: flex-start;
  color: var(--red);
  background: rgba(255, 0, 0, 0.08);
  font-size: 0.8rem;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 8px;
}
</style>
