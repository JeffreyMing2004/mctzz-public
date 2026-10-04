<script setup>
import PageHeader from "../components/PageHeader.vue";
import rules from "../data/rules.json";
</script>

<template>
  <div>
    <PageHeader :parts="['游戏', '规则']" subtitle="全面了解游戏机制，快速上手成为高手" v-reveal="{ y: 20, duration: 0.6 }" />

    <div class="container rules-wrap">
      <section
        v-for="(sec, i) in rules"
        :key="sec.title"
        class="rule-block"
        v-reveal="{ y: 20, duration: 0.5, delay: (i + 1) * 0.1 }"
      >
        <div class="rule-head">
          <h3>{{ sec.title }}</h3>
          <p>{{ sec.desc }}</p>
        </div>
        <ol class="rule-list">
          <li v-for="(item, i) in sec.items" :key="item">
            <span class="num">{{ i + 1 }}</span>
            <span class="text">{{ item }}</span>
          </li>
        </ol>
      </section>
    </div>
  </div>
</template>

<style scoped>
.rules-wrap {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 28px;
  padding-bottom: 96px;
}

.rule-block {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 32px 28px;
}

.rule-head {
  margin-bottom: 24px;
}

.rule-head h3 {
  color: var(--red);
  font-size: 1.3rem;
  margin-bottom: 6px;
}

.rule-head p {
  color: var(--text-dim);
  font-size: 0.92rem;
}

.rule-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.rule-list li {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.num {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(255, 0, 0, 0.12);
  border: 1px solid var(--red-soft);
  color: var(--red);
  font-size: 0.85rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.text {
  color: var(--text-muted);
  padding-top: 2px;
}
</style>
