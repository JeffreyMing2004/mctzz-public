// v-reveal 指令：复刻原站 framer-motion 的入场动画。
// 用法：v-reveal、v-reveal="{ y: 30, duration: 0.8, delay: 0.2 }"
//   mode: "mount"（默认，挂载即播放，对应原站 animate）
//         "inview"（进入视口播放一次，对应原站 whileInView + viewport:{once:true}；
//                  若元素已被快速滚动跳过则直接显示）
// 参数：x / y（位移 px）、scale（起始缩放）、duration（秒）、delay（秒）

const pending = new Set();
let listening = false;

function revealEl(el) {
  pending.delete(el);
  el.classList.add("revealed");
  if (pending.size === 0) stopListening();
}

function sweep() {
  const vh = window.innerHeight;
  for (const el of [...pending]) {
    const rect = el.getBoundingClientRect();
    // 进入视口下沿附近，或已被跳过（位于视口上方）时触发
    if (rect.top < vh * 0.92 || rect.bottom < 0) revealEl(el);
  }
}

function onScroll() {
  requestAnimationFrame(sweep);
}

function startListening() {
  if (listening) return;
  listening = true;
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
}

function stopListening() {
  if (!listening) return;
  listening = false;
  window.removeEventListener("scroll", onScroll);
  window.removeEventListener("resize", onScroll);
}

function apply(el, opts) {
  el.dataset.reveal = "";
  el.style.setProperty("--rv-x", `${opts.x ?? 0}px`);
  el.style.setProperty("--rv-y", `${opts.y ?? 20}px`);
  if (opts.scale) el.style.setProperty("--rv-scale", opts.scale);
  el.style.setProperty("--rv-delay", `${opts.delay ?? 0}s`);
  el.style.setProperty("--rv-dur", `${opts.duration ?? 0.6}s`);
}

function play(el) {
  // 双 rAF 确保初始隐藏样式先完成布局，动画从隐藏态过渡
  requestAnimationFrame(() =>
    requestAnimationFrame(() => el.classList.add("revealed")),
  );
}

export const reveal = {
  mounted(el, binding) {
    const opts = binding.value || {};
    apply(el, opts);
    if (opts.mode === "inview") {
      pending.add(el);
      startListening();
      sweep();
    } else {
      play(el);
    }
  },
  unmounted(el) {
    pending.delete(el);
    if (pending.size === 0) stopListening();
  },
};
