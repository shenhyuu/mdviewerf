<script setup lang="ts">
import {ref, onMounted, watch} from 'vue';
import {useRoute, useRouter} from 'vue-router';

const isDarkTheme = ref(false);
const route = useRoute();
const router = useRouter();

// 定义emit
const emit = defineEmits(['toggle']);

// 初始化主题状态
onMounted(() => {
  // 从文档类名中获取当前主题状态
  isDarkTheme.value = document.documentElement.classList.contains('dark-theme');
});

// 切换主题
const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value;
  // 触发toggle事件通知父组件
  emit('toggle');
};

// 监听外部主题变化（如果父组件更新了主题）
watch(() => document.documentElement.classList.contains('dark-theme'), (isDark) => {
  isDarkTheme.value = isDark;
});
</script>

<template>
  <div class="theme-toggle">
    <button @click="toggleTheme" :title="isDarkTheme ? '切换到亮色模式' : '切换到暗色模式'" class="theme-transition">
      <div v-if="isDarkTheme" class="icon">
        <!-- 太阳图标 -->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      </div>
      <div v-else class="icon">
        <!-- 月亮图标 -->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      </div>
    </button>
  </div>
</template>

<style scoped>
.theme-toggle {
  /* 移除固定定位相关样式，因为已经由父元素控制 */
  position: relative;
  z-index: 101; /* 确保在分裂按钮之上 */
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
  padding: 0;
  box-shadow: 0 4px 8px var(--shadow-color);
  will-change: transform, box-shadow;
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