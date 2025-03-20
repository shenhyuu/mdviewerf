<script setup lang="ts">
import {useRouter, useRoute} from 'vue-router';
import {computed, ref, onMounted, watch} from 'vue';

const router = useRouter();
const route = useRoute();
const isAnimated = ref(false); // 用于控制动画状态
const isAnimatedOut = ref(false); // 用于控制退出动画状态

// 跳转到主页
const goHome = () => {
  // 点击返回主页时先触发退出动画
  isAnimatedOut.value = true;
  // 延迟导航以等待动画完成
  setTimeout(() => {
    router.push('/');
  }, 250); // 减少延迟时间，使退出更快
};

// 计算当前是否在主页
const showHomeButton = computed(() => {
  // 主页路径为'/'或者路由名称为'contents'
  return route.path !== '/' && route.name !== 'contents';
});

// 在组件挂载后，如果按钮需要显示，则触发动画
onMounted(() => {
  if (showHomeButton.value) {
    // 直接设置动画状态，不延迟
    isAnimated.value = true;
  }
});

// 监听路由变化，在路由切换时设置动画状态
const previousRouteWasHome = ref(true);

// 当路由变化时，重置动画状态
router.afterEach((to, from) => {
  const isFromHome = from.path === '/' || from.name === 'contents';
  const isToDetail = to.path !== '/' && to.name !== 'contents';
  
  // 重置退出动画状态
  isAnimatedOut.value = false;

  if (isFromHome && isToDetail) {
    // 移除动画状态重置，避免闪烁
    // isAnimated.value = false;
    previousRouteWasHome.value = true;
    
    // 使用requestAnimationFrame代替setTimeout，确保在浏览器渲染前设置状态
    requestAnimationFrame(() => {
      isAnimated.value = true;
    });
  } else {
    previousRouteWasHome.value = false;
  }
});
</script>

<template>
  <transition name="split-button" appear>
    <div class="home-button" 
        v-if="showHomeButton" 
        :class="{ 
          'animated': isAnimated && previousRouteWasHome,
          'animated-out': isAnimatedOut
        }"
        style="backface-visibility: hidden;">
      <button @click="goHome" title="返回主页">
        <div class="icon">
          <!-- 主页图标 -->
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </div>
      </button>
    </div>
  </transition>
</template>

<style scoped>
.home-button {
  /* 移除固定定位相关样式，因为已经由父元素控制 */
  transform-origin: left center;
}

button {
  background-color: var(--button-bg);
  color: var(--button-text);
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
  box-shadow: 0 4px 8px var(--shadow-color);
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px var(--shadow-color);
}

.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

/* 分裂动画效果 */
.split-button-enter-active {
  animation: splitFromThemeButton 0.4s ease-out;
  /* 确保动画结束状态保持 */
  animation-fill-mode: forwards;
  /* 提高动画性能 */
  will-change: transform, opacity;
}

.split-button-leave-active {
  animation: splitFromThemeButton 0.4s ease-in reverse;
  /* 提高动画性能 */
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

/* 添加手动触发的动画类 */
.animated button {
  animation: fadeInRotate 0.4s ease-out;
  /* 确保动画结束状态保持，防止闪烁 */
  animation-fill-mode: forwards;
  /* 防止动画重复播放 */
  animation-iteration-count: 1;
  /* 提高性能 */
  will-change: transform, opacity;
}

@keyframes fadeInRotate {
  0% {
    opacity: 0;
    transform: rotate(-90deg) scale(0);
  }
  50% {
    opacity: 0.7;
    transform: rotate(-45deg) scale(0.5);
  }
  100% {
    opacity: 1;
    transform: rotate(0) scale(1);
  }
}

/* 新增退出动画效果 */
.animated-out button {
  animation: fadeOutRotate 0.25s ease-in;
  /* 确保动画结束状态保持 */
  animation-fill-mode: forwards;
  /* 防止动画重复播放 */
  animation-iteration-count: 1;
  /* 提高性能 */
  will-change: transform, opacity;
}

@keyframes fadeOutRotate {
  0% {
    opacity: 1;
    transform: rotate(0) scale(1);
  }
  50% {
    opacity: 0.5;
    transform: rotate(-45deg) scale(0.5);
  }
  100% {
    opacity: 0;
    transform: rotate(-90deg) scale(0);
  }
}

/* 平板和手机断点调整 */
@media (max-width: 768px) {
  button {
    width: 45px;
    height: 45px;
  }

  .icon {
    width: 20px;
    height: 20px;
  }
}
</style> 