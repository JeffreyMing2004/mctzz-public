<script setup>
import { ref } from "vue";
import { useRoute } from "vue-router";

const menuOpen = ref(false);
const route = useRoute();

const mainLinks = [
  { label: "首页", to: "/" },
  { label: "往期内容", to: "/episodes" },
  { label: "游戏规则", to: "/rules" },
  { label: "梗百科", to: "/memes" },
  { label: "排行榜", to: "/rankings" },
  { label: "播放量", to: "/bilibili-rankings" },
];

const archiveLinks = [
  { label: "玩家档案", to: "/players" },
  { label: "猎人档案", to: "/hunters" },
];

const isActive = (to) =>
  to === "/" ? route.path === "/" : route.path.startsWith(to);
</script>

<template>
  <header class="navbar">
    <div class="navbar-inner container">
      <router-link to="/" class="brand" @click="menuOpen = false">
        <img src="/images/brand/logo.png" alt="方块逃亡中 Logo" />
      </router-link>

      <nav class="nav-links" :class="{ open: menuOpen }">
        <router-link
          v-for="link in mainLinks"
          :key="link.to"
          :to="link.to"
          class="nav-link"
          :class="{ active: isActive(link.to) }"
          @click="menuOpen = false"
        >
          {{ link.label }}
        </router-link>

        <div class="dropdown">
          <button type="button" class="nav-link dropdown-toggle">
            档案
            <svg viewBox="0 0 24 24" class="caret" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          <div class="dropdown-menu">
            <router-link
              v-for="link in archiveLinks"
              :key="link.to"
              :to="link.to"
              class="dropdown-item"
              :class="{ active: isActive(link.to) }"
              @click="menuOpen = false"
            >
              {{ link.label }}
            </router-link>
          </div>
        </div>
      </nav>

      <button
        type="button"
        class="menu-toggle"
        aria-label="菜单"
        @click="menuOpen = !menuOpen"
      >
        <span v-if="!menuOpen">☰</span>
        <span v-else>✕</span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(204, 0, 0, 0.25);
}

.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.brand img {
  height: 40px;
  width: auto;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 28px;
}

.nav-link {
  color: var(--text-muted);
  font-size: 0.95rem;
  font-weight: 500;
  transition: color 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.nav-link:hover,
.nav-link.active {
  color: var(--red);
}

.dropdown {
  position: relative;
}

.caret {
  width: 14px;
  height: 14px;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--card);
  border: 1px solid var(--red-soft);
  border-radius: 10px;
  padding: 6px;
  min-width: 132px;
  display: none;
  flex-direction: column;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.6);
}

.dropdown:hover .dropdown-menu {
  display: flex;
  animation: menu-in 0.25s ease-out both;
}

@keyframes menu-in {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.dropdown-item {
  padding: 9px 14px;
  border-radius: 7px;
  color: var(--text-muted);
  font-size: 0.92rem;
  white-space: nowrap;
}

.dropdown-item:hover {
  background: rgba(255, 0, 0, 0.12);
  color: var(--red);
}

.dropdown-item.active {
  color: var(--red);
}

.menu-toggle {
  display: none;
  font-size: 1.4rem;
  color: #fff;
}

@media (max-width: 860px) {
  .menu-toggle {
    display: block;
  }

  .nav-links {
    position: absolute;
    top: 64px;
    left: 0;
    right: 0;
    background: rgba(10, 10, 10, 0.98);
    flex-direction: column;
    align-items: flex-start;
    padding: 16px 24px 24px;
    gap: 16px;
    border-bottom: 1px solid var(--red-soft);
    display: none;
  }

  .nav-links.open {
    display: flex;
    animation: mobile-menu-in 0.25s ease-out both;
  }

  @keyframes mobile-menu-in {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .dropdown-menu {
    position: static;
    transform: none;
    display: flex;
    border: none;
    background: transparent;
    box-shadow: none;
    padding: 0 0 0 12px;
  }
}
</style>
