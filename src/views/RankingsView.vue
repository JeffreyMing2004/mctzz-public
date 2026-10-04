<script setup>
import { computed, ref } from "vue";
import rankings from "../data/rankings.json";
import players from "../data/players.json";

// 与原站一致：每次进入页面都先显示剧透警告门，
// 点击「我已了解」后播放 1.5s 扫描线 + 红光扫屏，再进入榜单
const accepted = ref(false);
const scanning = ref(false);
const tab = ref("current"); // current | season
const currentEpisode = ref(1);
const currentSeason = ref(0);

function accept() {
  scanning.value = true;
  setTimeout(() => {
    accepted.value = true;
    scanning.value = false;
  }, 1500);
}

const playerById = Object.fromEntries(players.map((p) => [p.id, p]));

const episodeNumbers = [...new Set(rankings.map((r) => r.episode_number))].sort(
  (a, b) => a - b,
);
const seasons = [...new Set(rankings.map((r) => r.season))].sort((a, b) => a - b);
if (!episodeNumbers.includes(currentEpisode.value)) {
  currentEpisode.value = episodeNumbers[0] ?? 1;
}
if (!seasons.includes(currentSeason.value)) {
  currentSeason.value = seasons[0] ?? 0;
}

const currentRows = computed(() =>
  rankings
    .filter((r) => r.episode_number === currentEpisode.value)
    .sort((a, b) => b.total_score - a.total_score)
    .map((r) => ({
      ...r,
      player: playerById[r.player_id],
    })),
);

const seasonRows = computed(() => {
  const agg = new Map();
  for (const r of rankings.filter((r) => r.season === currentSeason.value)) {
    const hit = agg.get(r.player_id);
    if (hit) {
      hit.total_score += r.total_score;
      if (r.steps > 0) hit.steps = (hit.steps || 0) + r.steps;
    } else {
      agg.set(r.player_id, { ...r, steps: r.steps || 0 });
    }
  }
  return Array.from(agg.values())
    .sort((a, b) => b.total_score - a.total_score)
    .map((r) => ({ ...r, player: playerById[r.player_id] }));
});

const rows = computed(() => (tab.value === "current" ? currentRows.value : seasonRows.value));

const rankClass = (i) => (i < 3 ? `top top-${i + 1}` : "");
</script>

<template>
  <!-- 剧透警告门（每次进入页面都会显示，与原站一致） -->
  <div v-if="!accepted" class="gate">
    <Transition name="gate-pop" appear>
      <div v-if="!scanning" class="gate-card">
        <div class="gate-head">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="gate-icon">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
            <path d="M12 9v4m0 4h.01" />
          </svg>
          <h1 class="gate-title">剧透<span class="accent">警告</span></h1>
          <p class="gate-desc">排行榜可能会产生剧透，请确保看完本季正片再进入</p>
        </div>
        <div class="gate-actions">
          <router-link to="/" class="gate-btn ghost">返回主页</router-link>
          <button type="button" class="gate-btn solid" @click="accept">我已了解</button>
        </div>
      </div>
    </Transition>
  </div>

  <!-- 红光扫屏过渡（1.5s） -->
  <Transition name="scan-fade">
    <div v-if="scanning" class="scan-overlay">
      <div class="scan-lines"></div>
      <div class="scan-sweep"></div>
    </div>
  </Transition>

  <!-- 榜单 -->
  <div v-if="accepted">
    <div class="page-header" v-reveal="{ y: 20, duration: 0.6 }">
      <h1>排行<span class="accent">榜</span></h1>
      <p class="subtitle">查看玩家的总排名和统计数据</p>
    </div>

    <div class="container">
      <div class="tabs" v-reveal="{ y: 20, duration: 0.6, delay: 0.2 }">
        <button
          type="button"
          class="tab-btn"
          :class="{ active: tab === 'current' }"
          @click="tab = 'current'"
        >
          本期排行榜
        </button>
        <button
          type="button"
          class="tab-btn"
          :class="{ active: tab === 'season' }"
          @click="tab = 'season'"
        >
          本季排行榜
        </button>
      </div>

      <!-- :key 随主 Tab 变化，切换时重放滑入动画（原站行为） -->
      <div v-if="tab === 'current'" class="chips" key="chips-current">
        <button
          v-for="n in episodeNumbers"
          :key="n"
          type="button"
          class="chip"
          :class="{ active: currentEpisode === n }"
          @click="currentEpisode = n"
        >
          第{{ n }}期
        </button>
      </div>
      <div v-else class="chips" key="chips-season">
        <button
          v-for="s in seasons"
          :key="s"
          type="button"
          class="chip"
          :class="{ active: currentSeason === s }"
          @click="currentSeason = s"
        >
          第{{ s }}季
        </button>
      </div>

      <div class="board" :key="`${tab}-${tab === 'current' ? currentEpisode : currentSeason}`">
        <div class="row head">
          <span class="c-rank">排名</span>
          <span class="c-player">玩家</span>
          <span class="c-steps">本期步数</span>
          <span class="c-score">总积分</span>
        </div>
        <div
          v-for="(row, i) in rows"
          :key="row.id"
          class="row rv-slide"
          :style="{ '--rv-delay': `${Math.min(i * 0.06, 1.2)}s` }"
        >
          <span class="c-rank" :class="rankClass(i)">{{ i + 1 }}</span>
          <span class="c-player">
            <img
              v-if="row.player?.avatar"
              :src="row.player.avatar"
              :alt="row.player?.name"
              loading="lazy"
            />
            <span class="name">{{ row.player?.name || "未知玩家" }}</span>
          </span>
          <span class="c-steps">{{ row.steps > 0 ? row.steps : "未统计" }}</span>
          <span class="c-score">{{ row.total_score }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gate {
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.gate-card {
  width: 100%;
  max-width: 460px;
  background: var(--card);
  border: 1px solid var(--red-soft);
  border-radius: 18px;
  padding: 40px 32px;
  text-align: center;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
}

.gate-head {
  margin-bottom: 28px;
}

.gate-icon {
  width: 56px;
  height: 56px;
  color: var(--red);
  margin: 0 auto 18px;
}

.gate-title {
  color: #fff;
  font-size: 1.9rem;
  font-weight: 800;
  margin-bottom: 12px;
}

.gate-title .accent {
  color: var(--red);
}

.gate-desc {
  color: var(--text-muted);
  font-size: 1rem;
  line-height: 1.7;
}

.gate-actions {
  display: flex;
  gap: 14px;
}

.gate-btn {
  flex: 1;
  padding: 12px 0;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.gate-btn.ghost {
  background: var(--card-2);
  color: var(--text-muted);
}

.gate-btn.ghost:hover {
  color: #fff;
  border-color: var(--red);
}

.gate-btn.solid {
  background: var(--red);
  color: #fff;
}

.gate-btn.solid:hover {
  background: var(--red-dark);
}

/* 门卡片：缩放弹入 / 放大淡出（原站 exit: opacity 0, scale 1.1） */
.gate-pop-enter-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.gate-pop-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.gate-pop-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.gate-pop-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

/* 扫描线 + 红光扫屏（复刻原站 1.5s 过渡） */
.scan-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: #000;
  overflow: hidden;
}

.scan-lines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    #ff000033 2px,
    #ff000033 4px
  );
  animation: scan-fade-in 0.4s ease both;
}

.scan-sweep {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to right,
    transparent,
    #ff0000,
    transparent
  );
  opacity: 0.3;
  transform-origin: center;
  animation: scan-sweep 1.5s ease-in-out both;
}

@keyframes scan-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scan-sweep {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

.scan-fade-leave-active {
  transition: opacity 0.3s ease;
}

.scan-fade-leave-to {
  opacity: 0;
}

/* 榜单行：自左滑入 + 交错（原站 x:-20, duration .4, delay i*.06） */
.rv-slide {
  animation: rv-row 0.4s ease-out both;
  animation-delay: var(--rv-delay, 0s);
}

@keyframes rv-row {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.tabs {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 20px;
}

.tab-btn {
  padding: 12px 28px;
  border-radius: 10px;
  background: var(--card);
  color: var(--text-muted);
  font-weight: 700;
  border: 1px solid var(--red-soft);
  transition: all 0.2s ease;
}

.tab-btn:hover {
  color: #fff;
  border-color: var(--red);
}

.tab-btn.active {
  background: var(--red);
  color: #fff;
}

.chips {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 32px;
  animation: rv-chips 0.3s ease-out both;
}

@keyframes rv-chips {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chip {
  padding: 6px 16px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  background: var(--card-2);
  color: var(--text-muted);
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.chip:hover {
  color: #fff;
  border-color: var(--red);
}

.chip.active {
  background: var(--red);
  color: #fff;
  transform: scale(1.05);
}

.board {
  max-width: 860px;
  margin: 0 auto 96px;
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
  background: var(--card);
}

.row {
  display: grid;
  grid-template-columns: 72px 1fr 140px 140px;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(204, 0, 0, 0.15);
}

.row:last-child {
  border-bottom: none;
}

.row.head {
  background: var(--bg-soft);
  color: var(--text-dim);
  font-size: 0.85rem;
  font-weight: 600;
}

.c-rank {
  text-align: center;
  font-weight: 800;
  color: var(--text-muted);
}

.c-rank.top-1 {
  color: var(--gold);
}

.c-rank.top-2 {
  color: var(--silver);
}

.c-rank.top-3 {
  color: var(--bronze);
}

.c-player {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.c-player img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--border);
}

.name {
  color: #fff;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.c-steps,
.c-score {
  text-align: center;
  color: var(--text-muted);
  font-size: 0.92rem;
}

.c-score {
  font-weight: 700;
  color: #fff;
}

@media (max-width: 640px) {
  .row {
    grid-template-columns: 48px 1fr 90px 100px;
    padding: 12px 10px;
  }

  .c-steps {
    font-size: 0.8rem;
  }

  .c-score {
    font-size: 0.85rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .rv-slide,
  .chips,
  .scan-sweep,
  .scan-lines {
    animation: none;
  }
}
</style>
