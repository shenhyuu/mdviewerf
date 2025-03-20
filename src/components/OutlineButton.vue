<script setup lang="ts">
import {ref, watch, onMounted, onUnmounted} from 'vue';
import {useRoute, useRouter} from 'vue-router';

// 控制大纲显示状态
const isOutlineVisible = ref(false);
const route = useRoute();
const router = useRouter();

// 动画相关状态
const isAnimated = ref(false);
const isAnimatedOut = ref(false);
const previousRouteWasHome = ref(true);

// 监听路由变化，更新大纲显示状态
watch(() => route.path, (path) => {
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
  const outlineButton = document.querySelector('.outline-button button');
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

// 在组件挂载后设置动画状态
onMounted(() => {
  // 直接设置动画状态
  isAnimated.value = true;
  // 添加点击外部事件监听器
  document.addEventListener('click', handleClickOutside);
});

// 在组件卸载时移除事件监听器
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// 当路由变化时设置动画状态
router.afterEach((to, from) => {
  const isFromHome = from.path === '/' || from.name === 'contents';
  const isToDetail = to.path !== '/' && to.name !== 'contents';
  const isToHome = to.path === '/' || to.name === 'contents';

  // 如果导航到主页，添加退出动画
  if (isToHome && !isFromHome) {
    isAnimatedOut.value = true;
    // 允许动画完成
    setTimeout(() => {
      isAnimatedOut.value = false;
    }, 250); // 修改为250ms，加快动画完成时间
  } else {
    isAnimatedOut.value = false;
  }

  if (isFromHome && isToDetail) {
    previousRouteWasHome.value = true;
    
    // 使用requestAnimationFrame确保动画状态在下一帧更新
    requestAnimationFrame(() => {
      isAnimated.value = true;
    });
  } else {
    previousRouteWasHome.value = false;
  }
});

// 向父组件暴露大纲状态
defineExpose({
  isOutlineVisible
});
</script>

<template>
  <!-- 移除v-if="isDocPage"，由父组件控制显示/隐藏 -->
  <div class="outline-button"
       :class="{ 
         'animated': isAnimated && previousRouteWasHome,
         'animated-out': isAnimatedOut 
       }"
       style="backface-visibility: hidden;">
    <button @click="toggleOutline" 
        :title="isOutlineVisible ? '隐藏大纲' : '显示大纲'"
        :class="{ 'active': isOutlineVisible }">
      <div class="icon">
        <!-- 简化SVG图标，与主页按钮保持一致的风格 -->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </div>
    </button>
  </div>
</template>

<style scoped>
.outline-button {
  /* 移除固定定位相关样式，因为已经由父元素控制 */
  transform-origin: left center;
}

button {
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
  padding: 0;
  /* 确保所有属性都有平滑过渡 */
  transition: transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease;
}

/* 非激活状态的悬停效果 */
button:not(.active):hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px var(--shadow-color);
}

/* 激活状态的悬停效果 */
button.active:hover {
  transform: translateY(-2px); /* 只有悬浮效果，旋转由图标处理 */
  box-shadow: 0 6px 12px var(--shadow-color);
}

/* 图标样式 */
.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  transition: transform 0.3s ease; /* 添加过渡效果 */
  transform-origin: center; /* 确保从中心旋转 */
}

/* 激活状态时旋转图标 */
button.active .icon {
  transform: rotate(90deg); /* 顺时针旋转90度 */
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
  /* 确保动画结束状态保持 */
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