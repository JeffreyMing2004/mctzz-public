<script setup>
import { computed, ref } from "vue";
import PageHeader from "../components/PageHeader.vue";
import videos from "../data/bilibili_videos.json";

const seriesFilters = ["全员逃走中", "全员密告中", "全员推理中"];
const activeSeries = ref("");

const list = computed(() =>
  videos
    .filter((v) => !activeSeries.value || v.series_type === activeSeries.value)
    .sort((a, b) => b.view_count - a.view_count),
);

const lastUpdate = computed(() => {
  const dates = videos
    .map((v) => v.last_update_date)
    .filter(Boolean)
    .sort();
  return dates[dates.length - 1] ?? "";
});

function formatViews(n) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
  return String(n);
}

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${y}年${m}月${d}日`;
}

function delta(v) {
  return v.view_count - (v.yesterday_view_count ?? 0);
}
</script>

<template>
  <div>
    <PageHeader
      :parts="['实时', '播放量']"
      subtitle="追踪 B 站视频最新播放数据，按播放量从高到低排序"
    />

    <div class="container">
      <p class="update-info">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="update-icon">
          <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
          <path d="M21 3v5h-5" />
        </svg>
        最后更新：{{ lastUpdate }}
      </p>

      <div class="filter-bar">
        <button
          type="button"
          class="filter-btn"
          :class="{ active: activeSeries === '' }"
          @click="activeSeries = ''"
        >
          全部
        </button>
        <button
          v-for="s in seriesFilters"
          :key="s"
          type="button"
          class="filter-btn"
          :class="{ active: activeSeries === s }"
          @click="activeSeries = s"
        >
          {{ s }}
        </button>
      </div>

      <div class="video-list">
        <a
          v-for="(v, i) in list"
          :key="v.id"
          :href="`https://www.bilibili.com/video/${v.bvid}`"
          target="_blank"
          rel="noopener noreferrer"
          class="video-item hover-lift"
        >
          <span class="rank" :class="`rank-${i + 1}`">{{ i + 1 }}</span>
          <div class="thumb">
            <img :src="v.cover_image_url" :alt="v.title" loading="lazy" />
            <span class="duration">{{ formatDuration(v.duration_seconds) }}</span>
          </div>
          <div class="info">
            <span class="series">{{ v.series_type || "全员逃走中" }}</span>
            <h3>{{ v.title }}</h3>
            <div class="sub">
              <span>{{ formatDate((v.publish_time || "").slice(0, 10)) }}</span>
              <span class="bvid">BV {{ v.bvid }}</span>
            </div>
          </div>
          <div class="views">
            <span class="count">{{ formatViews(v.view_count) }}</span>
            <span v-if="delta(v) > 0" class="delta">+{{ delta(v) }} 较昨日</span>
          </div>
        </a>
      </div>

      <p v-if="list.length === 0" class="empty-tip">暂无相关内容</p>
    </div>
  </div>
</template>

<style scoped>
.update-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-dim);
  font-size: 0.88rem;
  margin-bottom: 28px;
}

.update-icon {
  width: 15px;
  height: 15px;
  color: var(--red);
}

.video-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 900px;
  margin: 0 auto 96px;
}

.video-item {
  display: grid;
  grid-template-columns: 44px 176px 1fr auto;
  align-items: center;
  gap: 18px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px 18px;
}

.rank {
  text-align: center;
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--text-muted);
}

.rank-1 {
  color: var(--gold);
}

.rank-2 {
  color: var(--silver);
}

.rank-3 {
  color: var(--bronze);
}

.thumb {
  position: relative;
  width: 176px;
  aspect-ratio: 16 / 9.6;
  border-radius: 8px;
  overflow: hidden;
  background: #000;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.duration {
  position: absolute;
  right: 6px;
  bottom: 6px;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  font-size: 0.72rem;
  padding: 1px 7px;
  border-radius: 5px;
}

.info {
  min-width: 0;
}

.series {
  display: inline-block;
  color: var(--red);
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid var(--red-soft);
  border-radius: 6px;
  padding: 1px 8px;
  margin-bottom: 8px;
}

.info h3 {
  color: #fff;
  font-size: 1.02rem;
  margin-bottom: 6px;
}

.sub {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  color: var(--text-dim);
  font-size: 0.8rem;
}

.bvid {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.views {
  text-align: right;
}

.count {
  display: block;
  color: var(--red);
  font-size: 1.25rem;
  font-weight: 800;
}

.delta {
  color: var(--text-dim);
  font-size: 0.75rem;
}

@media (max-width: 720px) {
  .video-item {
    grid-template-columns: 32px 120px 1fr;
  }

  .views {
    grid-column: 3;
    text-align: left;
    margin-top: 6px;
  }

  .thumb {
    width: 120px;
  }
}
</style>
