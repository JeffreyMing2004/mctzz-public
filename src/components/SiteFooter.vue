<template>
  <footer class="footer">
    <div class="container footer-inner">
      <div class="brand">逃亡中</div>
      <div class="meta">
        <p class="copyright">© 2026 逃亡中。All rights reserved.</p>
        <p class="beian">
          <a href="https://beian.miit.gov.cn" target="_blank" rel="noopener noreferrer">
            皖 ICP 备 2026013794 号
          </a>
          <a
            href="http://www.beian.gov.cn/portal/registerSystemInfo"
            target="_blank"
            rel="noopener noreferrer"
            class="ga"
          >
            <img
              src="https://beian.mps.gov.cn/img/logo01.dd7ff50e.png"
              alt="公安备案标志"
            />
            皖公网安备 34070602000039 号
          </a>
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: #050505;
  border-top: 1px solid var(--red-soft);
  padding: 40px 0;
}

.footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
}

.brand {
  color: var(--red);
  font-size: 2rem;
  font-weight: 800;
}

.meta {
  text-align: right;
  color: var(--text-dim);
  font-size: 0.85rem;
}

.meta a {
  color: var(--text-dim);
  transition: color 0.2s ease;
}

.meta a:hover {
  color: var(--red);
}

.beian {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  flex-wrap: wrap;
  margin-top: 6px;
}

.beian .ga {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.beian .ga img {
  width: 14px;
  height: 14px;
}

@media (max-width: 640px) {
  .footer-inner {
    flex-direction: column;
  }

  .meta {
    text-align: center;
  }

  .beian {
    justify-content: center;
  }
}
</style>
