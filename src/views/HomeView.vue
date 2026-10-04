<script setup>
import episodes from "../data/episodes.json";

// 最新动态区块内容与原站首页一致（S5E2 江烟镇，热播中）
const featured = {
  cover: "/images/covers/dc938d69-7d39-41fc-a739-ea7e522512d5.jpg",
  date: "2026-07-09",
  players: "20 位玩家",
  status: "热播中",
  description:
    "本期节目迎来了前所未有的挑战，玩家需要在限定时间内完成多重任务， 同时躲避猎人的追捕。紧张刺激的追逐场面，意想不到的反转剧情， 让所有观众屏息凝神。",
  link: "https://www.bilibili.com/video/BV19ARVBFEax",
};

const archives = [
  {
    title: "玩家档案库",
    desc: "查看所有参与玩家的详细信息、参赛历史和统计数据",
    to: "/players",
    icon: "users",
  },
  {
    title: "往期内容",
    desc: "按分类浏览历期节目介绍，快速找到想看的期数",
    to: "/episodes",
    icon: "film",
  },
  {
    title: "游戏规则",
    desc: "详细了解游戏机制、特殊道具和胜利条件",
    to: "/rules",
    icon: "book",
  },
  {
    title: "梗百科",
    desc: "收录经典名场面和粉丝文化梗，快速理解术语",
    to: "/memes",
    icon: "bulb",
  },
];

const totalEpisodes = episodes.length;
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="hero">
      <div class="hero-watermark" aria-hidden="true"></div>
      <div class="hero-inner container">
        <h1 class="hero-logo-wrap" v-reveal="{ y: 30, duration: 0.8 }">
          <img class="hero-logo" src="/images/brand/hero-logo.png" alt="方块逃亡中" />
        </h1>
        <p class="tagline" v-reveal="{ y: 20, duration: 0.8, delay: 0.2 }">
          茂逃百科 逃亡如此简单
        </p>
        <div v-reveal="{ y: 20, scale: 0.9, duration: 0.6, delay: 0.4 }">
          <router-link to="/episodes" class="cta">
            <svg viewBox="0 0 24 24" fill="currentColor" class="cta-icon">
              <path d="M8 5v14l11-7z" />
            </svg>
            开始逃亡
          </router-link>
          <p class="hero-stats">已收录 {{ totalEpisodes }} 期节目资料</p>
        </div>
      </div>
    </section>

    <!-- 绝密档案 -->
    <section class="section">
      <div class="container">
        <h2 class="section-title" v-reveal="{ mode: 'inview', y: 20, duration: 0.6 }">
          绝密<span class="accent">档案</span>
        </h2>
        <p class="section-subtitle" v-reveal="{ mode: 'inview', y: 20, duration: 0.6 }">&nbsp;</p>
        <div class="archive-grid" v-reveal="{ mode: 'inview', y: 20, duration: 0.6 }">
          <router-link
            v-for="item in archives"
            :key="item.to"
            :to="item.to"
            class="archive-card hover-glow"
          >
            <span class="archive-icon">
              <svg
                v-if="item.icon === 'users'"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <svg
                v-else-if="item.icon === 'film'"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M2 10h20" />
                <path d="M6 4v6m4-6v6m4-6v6m4-6v6" />
              </svg>
              <svg
                v-else-if="item.icon === 'book'"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
              <svg
                v-else
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M9 18h6" />
                <path d="M10 22h4" />
                <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
              </svg>
            </span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.desc }}</p>
          </router-link>
        </div>
      </div>
    </section>

    <!-- 最新动态 -->
    <section class="section section-last">
      <div class="container">
        <h2 class="section-title" v-reveal="{ mode: 'inview', y: 20, duration: 0.6 }">
          最新<span class="accent">动态</span>
        </h2>
        <p class="section-subtitle" v-reveal="{ mode: 'inview', y: 20, duration: 0.6 }">
          追踪节目最新更新和精彩内容
        </p>
        <article
          class="feature-card"
          v-reveal="{ mode: 'inview', y: 30, duration: 0.6, delay: 0.2 }"
        >
          <div class="feature-cover">
            <img :src="featured.cover" alt="第五季第二期" />
          </div>
          <div class="feature-body">
            <div class="feature-meta">
              <div class="meta-left">
                <span class="meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="meta-icon">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  {{ featured.date }}
                </span>
                <span class="meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="meta-icon">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  {{ featured.players }}
                </span>
              </div>
              <span class="status-badge">{{ featured.status }}</span>
            </div>
            <p class="feature-desc">{{ featured.description }}</p>
            <a
              :href="featured.link"
              target="_blank"
              rel="noopener noreferrer"
              class="feature-btn"
            >
              查看详情
            </a>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background:
    radial-gradient(ellipse 70% 55% at 50% 42%, rgba(120, 0, 0, 0.55), transparent 70%),
    var(--bg);
}

.hero-watermark {
  position: absolute;
  inset: 0;
  background-image: url("/images/brand/hero-logo.png");
  background-repeat: no-repeat;
  background-size: min(85vw, 900px);
  background-position: center 30%;
  opacity: 0.06;
  pointer-events: none;
  animation: wm-in 1.4s ease-out both;
}

@keyframes wm-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 0.06;
  }
}

.hero-logo-wrap {
  font-size: 0;
}

.hero-inner {
  position: relative;
  text-align: center;
  padding: 80px 16px;
}

.hero-logo {
  width: min(62vw, 420px);
  margin: 0 auto 28px;
  filter: drop-shadow(0 0 40px rgba(255, 0, 0, 0.35));
}

.tagline {
  color: var(--text-muted);
  font-size: clamp(1.05rem, 2.4vw, 1.4rem);
  margin-bottom: 32px;
}

.cta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: var(--red);
  color: #fff;
  font-weight: 700;
  font-size: 1.1rem;
  padding: 14px 38px;
  border-radius: 10px;
  transition: background 0.2s ease, transform 0.2s ease;
}

.cta:hover {
  background: var(--red-dark);
  transform: translateY(-2px);
}

.cta-icon {
  width: 20px;
  height: 20px;
}

.hero-stats {
  margin-top: 28px;
  color: var(--text-dim);
  font-size: 0.9rem;
}

@media (prefers-reduced-motion: reduce) {
  .hero-watermark {
    animation: none;
  }
}

.section {
  padding: 72px 0;
}

.section-last {
  padding-bottom: 96px;
}

.archive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
}

.archive-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 28px 24px;
  display: block;
}

.archive-icon {
  display: inline-flex;
  width: 44px;
  height: 44px;
  color: var(--red);
  margin-bottom: 18px;
}

.archive-icon svg {
  width: 100%;
  height: 100%;
}

.archive-card h3 {
  color: #fff;
  font-size: 1.15rem;
  margin-bottom: 8px;
}

.archive-card p {
  color: var(--text-dim);
  font-size: 0.9rem;
}

.feature-card {
  max-width: 900px;
  margin: 0 auto;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
}

.feature-cover {
  aspect-ratio: 16 / 7.2;
  background: #000;
}

.feature-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.feature-body {
  padding: 28px;
}

.feature-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 18px;
}

.meta-left {
  display: flex;
  gap: 22px;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.meta-icon {
  width: 16px;
  height: 16px;
  color: var(--red);
}

.status-badge {
  background: var(--red);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: 999px;
}

.feature-desc {
  color: var(--text-muted);
  margin-bottom: 26px;
}

.feature-btn {
  display: inline-block;
  background: var(--red);
  color: #fff;
  font-weight: 700;
  padding: 11px 28px;
  border-radius: 9px;
  transition: background 0.2s ease;
}

.feature-btn:hover {
  background: var(--red-dark);
}
</style>
