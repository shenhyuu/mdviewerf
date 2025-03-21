<script setup lang="ts">
import {ref, onMounted, watch} from 'vue';
import {RouterView, useRoute, useRouter} from 'vue-router';
import ThemeToggle from './components/ThemeToggle.vue';
import HomeButton from './components/HomeButton.vue';
import OutlineButton from './components/OutlineButton.vue';

// 主题状态
const isDarkTheme = ref(false);
const route = useRoute();
const router = useRouter();
const showOutlineButton = ref(false);
const shouldAnimateOutline = ref(false);

// 监听路由变化，判断是否显示大纲按钮
watch(() => route.path, (path, oldPath) => {
  const isDocumentPath = path.includes('/documents/');
  const wasDocumentPath = oldPath && oldPath.includes('/documents/');
  
  // 如果从文档页面导航到非文档页面，触发退出动画
  if (wasDocumentPath && !isDocumentPath) {
    shouldAnimateOutline.value = true;
    // 延迟隐藏按钮，让动画有时间完成
    setTimeout(() => {
      showOutlineButton.value = false;
      shouldAnimateOutline.value = false;
    }, 250); // 修改为250ms，与按钮动画一致
  } else {
    // 直接设置按钮显示状态
    showOutlineButton.value = isDocumentPath;
  }
}, {immediate: true});

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
  if (isDarkTheme.value) {
    document.documentElement.classList.add('dark-theme');
    document.documentElement.classList.remove('light-theme');
  } else {
    document.documentElement.classList.add('light-theme');
    document.documentElement.classList.remove('dark-theme');
  }
};
</script>

<template>
  <div class="app">
    <!-- 功能按钮组 -->
    <div class="app-controls">
      <ThemeToggle @toggle="toggleTheme"/>
      <HomeButton/>
      <OutlineButton v-if="showOutlineButton || shouldAnimateOutline"/>
    </div>
    
    <!-- 路由视图 -->
    <RouterView/>
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
}

.app {
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

/* 添加淡入淡出动画 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* 重新定义与按钮组件一致的动画 */
.split-button-enter-active {
  animation: splitFromThemeButton 0.4s ease-out;
  animation-fill-mode: forwards;
  will-change: transform, opacity;
}

.split-button-leave-active {
  animation: splitFromThemeButton 0.25s ease-in reverse;
  animation-fill-mode: forwards;
  will-change: transform, opacity;
}

@keyframes splitFromThemeButton {
  0% {
    opacity: 0;
    transform: translateX(-40px) scale(0);
  }
  40% {
    opacity: 0.5;
    transform: translateX(-20px) scale(0.5) rotate(-45deg);
  }
  100% {
    opacity: 1;
    transform: translateX(0) scale(1) rotate(0);
  }
}

/* 主题切换过渡效果 */
.theme-transition {
  transition: background-color 0.3s ease, color 0.3s ease;
  /* 保留颜色变化过渡，但不含位移动效 */
}

/* 按钮过渡效果 - 这会影响所有按钮，但我们为主题按钮专门设置了样式覆盖这个效果 */
button {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

/* 卡片过渡效果 */
.card {
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

/* 链接过渡效果 */
a {
  transition: color 0.3s ease;
}
</style>
