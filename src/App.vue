<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import ThemeToggle from './components/ThemeToggle.vue';
import HomeButton from './components/HomeButton.vue';
import OutlineButton from './components/OutlineButton.vue';

// 主题状态
const isDarkTheme = ref(false);
const route = useRoute();
const showOutlineButton = ref(false);

// 监听路由变化，判断是否显示大纲按钮
watch(() => route.path, (path) => {
  showOutlineButton.value = path.includes('/documents/');
}, { immediate: true });

// 页面加载时检查主题偏好
onMounted(() => {
  const storedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  isDarkTheme.value = storedTheme === 'dark' || (!storedTheme && prefersDark);
  applyTheme();
  
  // 监听系统主题变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      isDarkTheme.value = e.matches;
      applyTheme();
    }
  });
});

// 切换主题
const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value;
  localStorage.setItem('theme', isDarkTheme.value ? 'dark' : 'light');
  applyTheme();
};

// 应用主题
const applyTheme = () => {
  document.documentElement.classList.toggle('dark', isDarkTheme.value);
};
</script>

<template>
  <div class="app">
    <!-- 路由视图 -->
    <RouterView />
    
    <!-- 功能按钮组 -->
    <div class="button-group">
      <HomeButton />
      <OutlineButton v-if="showOutlineButton" />
      <ThemeToggle @toggle="toggleTheme" />
    </div>
  </div>
</template>

<style>
/* 全局样式 */
:root {
  /* 浅色主题变量 */
  --primary-color-rgb: 66, 184, 131; /* #42b883 */
  --button-bg: #ffffff;
  --button-text: #213547;
  --button-text-rgb: 33, 53, 71;
  --button-hover-bg: #f5f5f5;
  --card-bg: #ffffff;
  --card-border: #e5e7eb;
  --heading-color: #213547;
  --text-color: #374151;
  --link-color: #42b883;
  --shadow-color: rgba(0, 0, 0, 0.1);
  --viewer-bg: #ffffff;
  --viewer-border: #e5e7eb;
  --error-color: #ef4444;
  --secondary-bg: #f9fafb;
}

.dark {
  /* 深色主题变量 */
  --primary-color-rgb: 100, 219, 166; /* #64dba6 */
  --button-bg: #1e293b;
  --button-text: #ffffff;
  --button-text-rgb: 255, 255, 255;
  --button-hover-bg: #2c3e50;
  --card-bg: #1e293b;
  --card-border: #334155;
  --heading-color: #e2e8f0;
  --text-color: #f1f5f9;
  --link-color: #64dba6;
  --shadow-color: rgba(0, 0, 0, 0.3);
  --viewer-bg: #1e293b;
  --viewer-border: #334155;
  --error-color: #f87171;
  --secondary-bg: #334155;
}

html, body {
  margin: 0;
  padding: 0;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--secondary-bg);
  color: var(--text-color);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.app {
  min-height: 100vh;
}

.button-group {
  position: fixed;
  left: 20px;
  top: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  z-index: 100;
}

* {
  box-sizing: border-box;
  transition: color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

/* 移动设备断点调整 */
@media (max-width: 768px) {
  .button-group {
    left: 15px;
    top: 15px;
    gap: 10px;
  }
}
</style>
