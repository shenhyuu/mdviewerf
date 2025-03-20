<script setup lang="ts">
import ThemeToggle from './components/ThemeToggle.vue';
import HomeButton from './components/HomeButton.vue';
import OutlineButton from './components/OutlineButton.vue';
import {ref, watch} from 'vue';
import {useRoute} from 'vue-router';

const route = useRoute();
const showOutlineButton = ref(false);

// 监听路由变化，判断是否显示大纲按钮
watch(() => route.path, (path) => {
  showOutlineButton.value = path.includes('/documents/');
}, {immediate: true});
</script>

<template>
  <div class="root-app">
    <div class="app-controls">
      <ThemeToggle/>
      <HomeButton/>
      <transition name="split-button">
        <OutlineButton v-if="showOutlineButton"/>
      </transition>
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

/* 添加淡入淡出动画 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* 重新定义与OutlineButton内部一致的动画 */
.split-button-enter-active {
  animation: splitFromThemeButton 0.5s ease-out;
  animation-fill-mode: forwards;
  will-change: transform, opacity;
}

.split-button-leave-active {
  animation: splitFromThemeButton 0.5s ease-in reverse;
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
    transform: translateX(-20px) scale(0.5);
  }
  100% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}
</style> 