<script setup>
defineProps({
  parts: { type: Array, required: true }, // 例：["往期", "内容"]，最后一段显示为红色
  subtitle: { type: String, default: "" },
});
</script>

<template>
  <div class="page-header">
    <h1>
      <template v-for="(part, i) in parts" :key="i">
        <span v-if="i === parts.length - 1" class="accent">{{ part }}</span>
        <template v-else>{{ part }}</template>
      </template>
    </h1>
    <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
  </div>
</template>
