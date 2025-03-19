<script setup lang="ts">
import ThemeToggle from './components/ThemeToggle.vue';
import HomeButton from './components/HomeButton.vue';
import OutlineButton from './components/OutlineButton.vue';
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const showOutlineButton = ref(false);

// 监听路由变化，判断是否显示大纲按钮
watch(() => route.path, (path) => {
  showOutlineButton.value = path.includes('/documents/');
}, { immediate: true });
</script>

<template>
  <div class="root-app">
    <div class="app-controls">
      <ThemeToggle />
      <HomeButton />
      <OutlineButton v-if="showOutlineButton" />
    </div>
    <router-view></router-view>
  </div>
</template>

<style>
.root-app {
  min-height: 100vh;
  width: 100%;
}

.app-controls {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* 移动设备断点调整 */
@media (max-width: 768px) {
  .app-controls {
    top: 15px;
    left: 15px;
    gap: 10px;
  }
}
</style> 