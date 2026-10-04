<script setup>
import { computed, onMounted, ref } from "vue";
import PageHeader from "../components/PageHeader.vue";
import rankings from "../data/rankings.json";
import players from "../data/players.json";

const SPOILER_KEY = "mctzz_rankings_accepted";

const accepted = ref(false);
const ready = ref(false);
const tab = ref("current"); // current | season
const currentEpisode = ref(1);
const currentSeason = ref(0);

onMounted(() => {
  accepted.value = localStorage.getItem(SPOILER_KEY) === "1";
  ready.value = true;
});

function accept() {
  localStorage.setItem(SPOILER_KEY, "1");
  accepted.value = true;
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

const rankClass = (i) => (i < 3 ? `top top-${i + 1}` : "");
</script>

<template>
  <div>
    <template v-if="!accepted">
      <PageHeader :parts="['剧透', '警告']" subtitle="排行榜可能会产生剧透，请确保看完本季正片再进入" />
      <div class="gate">
        <div class="gate-card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="gate-icon">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
            <path d="M12 9v4m0 4h.01" />
          </svg>
          <div class="gate-actions">
            <router-link to="/" class="gate-btn ghost">返回主页</router-link>
            <button type="button" class="gate-btn solid" @click="accept">我已了解</button>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <PageHeader :parts="['排行', '榜']" subtitle="查看玩家的总排名和统计数据" />

      <div class="container">
        <div class="tabs">
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

        <div v-if="tab === 'current'" class="chips">
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
        <div v-else class="chips">
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

        <div class="board">
          <div class="row head">
            <span class="c-rank">排名</span>
            <span class="c-player">玩家</span>
            <span class="c-steps">本期步数</span>
            <span class="c-score">总积分</span>
          </div>
          <div
            v-for="(row, i) in tab === 'current' ? currentRows : seasonRows"
            :key="row.id"
            class="row"
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
    </template>
  </div>
</template>

<style scoped>
.gate {
  display: flex;
  justify-content: center;
  padding: 24px 16px 96px;
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

.gate-icon {
  width: 56px;
  height: 56px;
  color: var(--red);
  margin: 0 auto 20px;
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
</style>
