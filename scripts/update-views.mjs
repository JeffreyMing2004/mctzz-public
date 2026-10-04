// 播放量每日更新脚本：从 B 站公开接口刷新 src/data/bilibili_videos.json，
// 并同步一份到 public/data/ 供页面运行时拉取。由 GitHub Actions 每天
// 北京时间 0 点（UTC 16:00）调度，也可手动运行：node scripts/update-views.mjs
//
// 更新语义与原站一致：
// - view_count / danmaku_count 写入最新值
// - 跨天（last_update_date !== 今天）时，把更新前的播放量记为 yesterday_view_count，
//   并将 last_update_date 置为今天；同一天内重复更新则保留昨日值，保证「较昨日」口径稳定
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const srcFile = path.join(root, "src", "data", "bilibili_videos.json");
const pubFile = path.join(root, "public", "data", "bilibili_videos.json");

const today = () => {
  // 以东八区日期为准（与原站部署时区无关）
  return new Date(Date.now() + 8 * 3600 * 1000).toISOString().split("T")[0];
};

async function fetchStats(bvid, tries = 3) {
  const url = `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
          Referer: "https://www.bilibili.com/",
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json();
      if (body.code !== 0 || !body.data?.stat) {
        throw new Error(`api code ${body.code} (${body.message ?? ""})`);
      }
      return {
        view_count: body.data.stat.view,
        danmaku_count: body.data.stat.danmaku,
      };
    } catch (e) {
      if (i === tries - 1) throw e;
      await new Promise(r => setTimeout(r, 1500 * (i + 1)));
    }
  }
}

const videos = JSON.parse(fs.readFileSync(srcFile, "utf8"));
const day = today();
let updated = 0, skipped = 0, failed = 0;
const failures = [];

for (const v of videos) {
  if (!v.bvid || !/^BV[A-Za-z0-9]+$/.test(v.bvid)) {
    skipped++;
    continue;
  }
  try {
    const stats = await fetchStats(v.bvid);
    const rollover = v.last_update_date !== day;
    const yesterday = rollover ? v.view_count : v.yesterday_view_count ?? 0;
    v.view_count = stats.view_count;
    v.danmaku_count = stats.danmaku_count;
    v.yesterday_view_count = yesterday;
    v.last_update_date = day;
    updated++;
    process.stdout.write(`✔ ${v.bvid} ${v.title} -> ${stats.view_count}\n`);
    // 限速，避免触发风控
    await new Promise(r => setTimeout(r, 400));
  } catch (e) {
    failed++;
    failures.push(`${v.bvid} ${v.title}: ${e.message}`);
    await new Promise(r => setTimeout(r, 1500));
  }
}

const out = JSON.stringify(videos, null, 2);
fs.mkdirSync(path.dirname(pubFile), { recursive: true });
fs.writeFileSync(srcFile, out);
fs.writeFileSync(pubFile, out);

console.log(`完成：更新 ${updated}，跳过 ${skipped}，失败 ${failed}，快照日期 ${day}`);
if (failures.length) {
  console.log(failures.join("\n"));
  // 个别失败不判失败退出，保留旧值下次重试；全部失败则报错
  if (updated === 0) process.exit(1);
}
