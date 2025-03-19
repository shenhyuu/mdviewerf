<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { computed, ref, onMounted } from 'vue';

const router = useRouter();
const route = useRoute();
const isAnimated = ref(false); // 用于控制动画状态

// 跳转到主页
const goHome = () => {
  router.push('/');
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
  
  if (isFromHome && isToDetail) {
    isAnimated.value = false;
    previousRouteWasHome.value = true;
    // 设置动画状态，使用较短的延迟
    setTimeout(() => {
      isAnimated.value = true;
    }, 50);
  } else {
    previousRouteWasHome.value = false;
  }
});
</script>

<template>
  <transition name="split-button" appear>
    <div class="home-button" v-if="showHomeButton" :class="{ 'animated': isAnimated && previousRouteWasHome }">
      <button @click="goHome" title="返回主页">
        <div class="icon">
          <!-- 主页图标 -->
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
  animation: splitFromThemeButton 0.5s ease-out;
}

.split-button-leave-active {
  animation: splitFromThemeButton 0.5s ease-in reverse;
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

/* 添加手动触发的动画类 */
.animated button {
  animation: fadeInRotate 0.5s ease-out;
}

@keyframes fadeInRotate {
  0% {
    opacity: 0;
    transform: rotate(-90deg) scale(0);
  }
  100% {
    opacity: 1;
    transform: rotate(0) scale(1);
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