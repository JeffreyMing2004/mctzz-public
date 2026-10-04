import { createRouter, createWebHistory } from "vue-router";

const routes = [
  { path: "/", name: "home", component: () => import("../views/HomeView.vue") },
  {
    path: "/episodes",
    name: "episodes",
    component: () => import("../views/EpisodesView.vue"),
  },
  {
    path: "/rules",
    name: "rules",
    component: () => import("../views/RulesView.vue"),
  },
  {
    path: "/memes",
    name: "memes",
    component: () => import("../views/MemesView.vue"),
  },
  {
    path: "/rankings",
    name: "rankings",
    component: () => import("../views/RankingsView.vue"),
  },
  {
    path: "/bilibili-rankings",
    name: "bilibili-rankings",
    component: () => import("../views/BilibiliRankingsView.vue"),
  },
  {
    path: "/players",
    name: "players",
    component: () => import("../views/PlayersView.vue"),
  },
  {
    path: "/hunters",
    name: "hunters",
    component: () => import("../views/HuntersView.vue"),
  },
  { path: "/:pathMatch(.*)*", redirect: "/" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

const titles = {
  home: "方块逃亡中 - 全员逃走中系列官方资料站",
  episodes: "往期内容 - 方块逃亡中",
  rules: "游戏规则 - 方块逃亡中",
  memes: "梗百科 - 方块逃亡中",
  rankings: "排行榜 - 方块逃亡中",
  "bilibili-rankings": "播放量 - 方块逃亡中",
  players: "玩家档案 - 方块逃亡中",
  hunters: "猎人档案 - 方块逃亡中",
};

router.afterEach((to) => {
  document.title = titles[to.name] ?? titles.home;
});

export default router;
