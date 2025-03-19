<script setup lang="ts">
import {ref, watch, onMounted, onUnmounted} from 'vue';
import {useRoute, useRouter} from 'vue-router';

// 控制大纲显示状态
const isOutlineVisible = ref(false);
const route = useRoute();
const router = useRouter();

// 动画相关状态
const isAnimated = ref(false);
const previousRouteWasHome = ref(true);

// 监听路由变化，在文档页面才显示按钮
const isDocPage = ref(false);

watch(() => route.path, (path) => {
  // 只在文档页面显示大纲按钮（非首页且包含 /documents/）
  isDocPage.value = path.includes('/documents/');

  // 路由变化时隐藏大纲
  isOutlineVisible.value = false;
}, {immediate: true});

// 切换大纲显示状态
const toggleOutline = () => {
  isOutlineVisible.value = !isOutlineVisible.value;
  // 发送自定义事件通知文档查看器组件
  window.dispatchEvent(new CustomEvent('outline-visibility-changed', {
    detail: {isVisible: isOutlineVisible.value}
  }));
};

// 处理点击外部事件
const handleClickOutside = (event: MouseEvent) => {
  // 获取大纲按钮元素
  const outlineButton = document.querySelector('.outline-button');
  // 获取大纲面板元素
  const outlinePanel = document.querySelector('.outline-panel');

  // 如果点击的不是大纲按钮或大纲面板，且大纲当前是可见的，则隐藏大纲
  if (outlineButton && outlinePanel &&
      !outlineButton.contains(event.target as Node) &&
      !outlinePanel.contains(event.target as Node) &&
      isOutlineVisible.value) {
    isOutlineVisible.value = false;
    // 发送自定义事件通知文档查看器组件
    window.dispatchEvent(new CustomEvent('outline-visibility-changed', {
      detail: {isVisible: false}
    }));
  }
};

// 在组件挂载后，如果按钮需要显示，则触发动画
onMounted(() => {
  if (isDocPage.value) {
    // 直接设置动画状态，不延迟
    isAnimated.value = true;
    // 添加点击外部事件监听器
    document.addEventListener('click', handleClickOutside);
  }
});

// 在组件卸载时移除事件监听器
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// 当路由变化时，重置动画状态
router.afterEach((to, from) => {
  const isFromHome = from.path === '/' || from.name === 'contents';
  const isToDetail = to.path !== '/' && to.name !== 'contents';

  if (isFromHome && isToDetail) {
    isAnimated.value = false;
    previousRouteWasHome.value = true;
    // 设置动画状态，使用较长的延迟，比主页按钮略晚一点触发
    setTimeout(() => {
      isAnimated.value = true;
    }, 250); // 主页按钮是50ms, 大纲按钮延迟更多以便看到分裂效果
  } else {
    previousRouteWasHome.value = false;
  }
});

// 向父组件暴露大纲状态和内容
defineExpose({
  isOutlineVisible
});
</script>

<template>
  <transition name="split-button" appear>
    <div class="outline-button-container" v-if="isDocPage" :class="{ 'animated': isAnimated && previousRouteWasHome }">
      <button
          class="outline-button"
          :class="{ 'active': isOutlineVisible }"
          @click="toggleOutline"
          aria-label="切换大纲显示"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
          <line x1="-3" y1="6" x2="27" y2="6"></line>
          <line x1="-3" y1="14" x2="27" y2="14"></line>
          <line x1="-3" y1="22" x2="27" y2="22"></line>
        </svg>
      </button>
    </div>
  </transition>
</template>

<style scoped>
.outline-button-container {
  /* 移除固定定位相关样式，因为已经由父元素控制 */
  position: relative;
  z-index: 100;
  transform-origin: left center;
}

.outline-button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: var(--button-bg);
  color: var(--button-text);
  border: none;
  box-shadow: 0 4px 8px var(--shadow-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.outline-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px var(--shadow-color);
}

.outline-button.active {
  background-color: var(--secondary-bg);
}

.icon {
  width: 24px;
  height: 24px;
}

/* 分裂动画效果 */
.split-button-enter-active {
  animation: splitFromHomeButton 0.5s ease-out;
}

.split-button-leave-active {
  animation: splitFromHomeButton 0.5s ease-in reverse;
}

@keyframes splitFromHomeButton {
  0% {
    opacity: 0;
    transform: translateY(-40px) scale(0);
  }
  40% {
    opacity: 0.5;
    transform: translateY(-20px) scale(0.5);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 添加手动触发的动画类 */
.animated button {
  animation: fadeInRotate 0.5s ease-out;
}

@keyframes fadeInRotate {
  0% {
    opacity: 0;
    transform: rotate(90deg) scale(0);
  }
  100% {
    opacity: 1;
    transform: rotate(0) scale(1);
  }
}

/* 平板和手机断点调整 */
@media (max-width: 768px) {
  .outline-button {
    width: 45px;
    height: 45px;
  }

  .icon {
    width: 20px;
    height: 20px;
  }
}
</style> 