# mctzz-public — 方块逃亡中资料站（Vue 重建版）

「方块逃亡中」（全员逃走中系列）官方资料站 www.mctzz.com 的 Vue 3 重建版本。经站点方授权，将原阿里云智能建站（wxz/React）实现迁移为开源的 Vue 3 + Vite 技术栈，页面结构与数据保持一致。

## 技术栈

- Vue 3（`<script setup>` 组合式 API）
- Vue Router 4（History 模式，8 个路由）
- Vite 6
- 纯手写 CSS（设计变量与原站对齐：主红 `#FF0000`、暗底 `#0A0A0A`、卡片 `#1A1A1A`）

## 页面

| 路由 | 说明 |
| --- | --- |
| `/` | 首页（Hero、绝密档案、最新动态） |
| `/episodes` | 往期内容（42 期，按系列筛选） |
| `/rules` | 游戏规则（基础规则 / 单元剧） |
| `/memes` | 梗百科（按分类筛选） |
| `/rankings` | 排行榜（剧透确认门 → 本期 / 本季榜单） |
| `/bilibili-rankings` | 实时播放量（B 站数据快照，按播放量排序） |
| `/players` | 玩家档案库（91 位玩家，搜索 / 排序） |
| `/hunters` | 猎人档案库 |

## 数据说明

数据来自原站后端（Supabase REST）的一次性快照，存放于 `src/data/*.json`：

- `episodes.json` — 42 期节目（标题、封面、简介、播出日期、人数、时长、B 站链接）
- `players.json` — 91 位玩家（头像、性别、参赛期数、平台、B 站主页）
- `rankings.json` — 第 5 季各期积分榜
- `bilibili_videos.json` — 41 个可见视频的播放量快照（含昨日增量）
- `memes.json` / `hunters.json` / `episode_*_categories.json` / `episode_links.json`

图片素材已全部本地化到 `public/images/`（封面 / 头像 / 品牌图），运行时不依赖外部 CDN。

> 更新数据：配置好访问凭据后执行 `npm run prepare-data` 可重新拉取数据并下载图片。

## 本地开发

```bash
npm install
npm run dev      # 开发服务器
npm run build    # 产物输出到 dist/
npm run preview  # 预览构建产物
```

## 许可与说明

- 页面内容、节目数据、图片素材版权归「方块逃亡中」项目组所有，仅供粉丝资料展示使用。
- 本仓库为站点前台实现；`scripts/prepare-data.mjs` 仅用于授权方的数据迁移。
