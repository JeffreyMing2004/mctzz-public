<script setup>
import { computed, onUnmounted } from "vue";
import episodeLinks from "../data/episode_links.json";

const props = defineProps({
  player: { type: Object, required: true },
});
const emit = defineEmits(["close"]);

// 原站：episode_list 为 JSON 字符串（如 "[13]"），期数 chip 链接到 episode_links
const episodeChips = computed(() => {
  let nums = [];
  try {
    nums = JSON.parse(props.player.episode_list || "[]");
  } catch {
    nums = [];
  }
  const linkByNum = Object.fromEntries(
    episodeLinks.map((l) => [l.episode_number, l]),
  );
  return nums.map((n) => {
    const link = linkByNum[n];
    return {
      num: n,
      label: link?.title || `第${n}期`,
      url: link?.link_url || "#",
    };
  });
});

function onKeydown(e) {
  if (e.key === "Escape") emit("close");
}
window.addEventListener("keydown", onKeydown);
onUnmounted(() => window.removeEventListener("keydown", onKeydown));
</script>

<template>
  <Teleport to="body">
    <div class="overlay" @click="emit('close')">
      <div class="modal" @click.stop>
        <button type="button" class="close-btn" aria-label="关闭" @click="emit('close')">
          ✕
        </button>
        <div class="cover">
          <img :src="player.avatar" :alt="player.name" />
          <div class="cover-fade"></div>
        </div>
        <div class="body">
          <div class="head">
            <h2>{{ player.name }}</h2>
            <p class="declaration">{{ player.declaration }}</p>
          </div>
          <div class="stats">
            <div class="stat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="stat-icon">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <div class="stat-num">{{ player.episodes }}</div>
              <div class="stat-label">参赛期数</div>
            </div>
            <div class="stat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="stat-icon">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
              <div class="stat-num">{{ player.win_episodes }}</div>
              <div class="stat-label">夺冠期数</div>
            </div>
            <div class="stat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="stat-icon">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4m0-4h.01" />
              </svg>
              <div class="stat-num">{{ player.gender }}</div>
              <div class="stat-label">性别</div>
            </div>
          </div>
          <div class="episodes">
            <h3>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="ep-icon">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              参赛期数详情
            </h3>
            <div class="chips">
              <a
                v-for="chip in episodeChips"
                :key="chip.num"
                :href="chip.url === '#' ? undefined : chip.url"
                :target="chip.url === '#' ? undefined : '_blank'"
                :rel="chip.url === '#' ? undefined : 'noopener noreferrer'"
                class="chip"
              >
                {{ chip.label }}
              </a>
              <span v-if="episodeChips.length === 0" class="no-chips">暂无记录</span>
            </div>
          </div>
          <div class="foot">
            <a
              v-if="player.bilibili_link"
              :href="player.bilibili_link"
              target="_blank"
              rel="noopener noreferrer"
              class="bili-btn"
            >
              访问 Bilibili 主页
            </a>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  padding: 16px;
  animation: overlay-in 0.25s ease both;
}

.overlay.is-leaving {
  animation: overlay-in 0.25s ease reverse both;
}

@keyframes overlay-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal {
  position: relative;
  width: 100%;
  max-width: 480px;
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  background: var(--card);
  border: 1px solid var(--red-soft);
  border-radius: 16px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
  animation: modal-in 0.3s ease both;
}

.modal.is-leaving {
  animation: modal-in 0.3s ease reverse both;
}

@keyframes modal-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(10, 10, 10, 0.8);
  color: #fff;
  font-size: 0.8rem;
  transition: background 0.2s ease;
}

.close-btn:hover {
  background: var(--red);
}

.cover {
  position: relative;
  height: 192px;
  background: linear-gradient(135deg, var(--card-2), var(--card));
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-fade {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, var(--card), transparent);
}

.body {
  padding: 0 24px 24px;
  margin-top: -48px;
  position: relative;
}

.head {
  text-align: center;
  margin-bottom: 24px;
}

.head h2 {
  color: #fff;
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 6px;
}

.declaration {
  color: #ff3333;
  font-weight: 500;
  font-size: 0.95rem;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 22px;
}

.stat {
  background: var(--bg);
  border: 1px solid rgba(204, 0, 0, 0.2);
  border-radius: 12px;
  padding: 14px 8px;
  text-align: center;
}

.stat-icon {
  width: 20px;
  height: 20px;
  color: var(--red);
  margin: 0 auto 8px;
}

.stat-num {
  color: #fff;
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1.2;
}

.stat-label {
  color: var(--text-muted);
  font-size: 0.72rem;
  margin-top: 4px;
}

.episodes {
  background: var(--bg);
  border: 1px solid rgba(204, 0, 0, 0.2);
  border-radius: 12px;
  padding: 16px;
}

.episodes h3 {
  color: #fff;
  font-size: 0.85rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.ep-icon {
  width: 15px;
  height: 15px;
  color: var(--red);
}

.chips {
  max-height: 160px;
  overflow-y: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-right: 6px;
}

.chip {
  flex-shrink: 0;
  padding: 6px 12px;
  background: var(--card);
  border: 1px solid var(--red-soft);
  border-radius: 9px;
  color: #fff;
  font-size: 0.85rem;
  transition: all 0.3s ease;
}

.chip:hover {
  background: var(--red);
  border-color: var(--red);
}

.no-chips {
  color: var(--text-dim);
  font-size: 0.85rem;
}

.foot {
  margin-top: 18px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}

.bili-btn {
  padding: 10px 22px;
  background: var(--red);
  border-radius: 999px;
  color: #fff;
  font-size: 0.88rem;
  font-weight: 500;
  transition: background 0.2s ease;
}

.bili-btn:hover {
  background: var(--red-dark);
}
</style>
