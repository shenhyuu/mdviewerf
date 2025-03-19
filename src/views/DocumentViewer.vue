<script setup lang="ts">
import {ref, watch, computed, onMounted} from 'vue';
import {useRoute} from 'vue-router';
import MarkdownViewer from '../components/MarkdownViewer.vue';
import OutlinePanel from '../components/OutlinePanel.vue';

const route = useRoute();
const markdownContent = ref('');
const error = ref<string | null>(null);
const loading = ref(true);

// 从后端加载Markdown文件
const loadMarkdownFile = async (uuid: string) => {
  loading.value = true;
  error.value = null;

  try {
    const response = await fetch(`http://127.0.0.1:8080/documents/${uuid}`);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('后端返回错误:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    const content = await response.text();
    error.value = null;
    markdownContent.value = content;

    // 提取并更新标题
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const newTitle = titleMatch ? titleMatch[1] : 'Markdown 文档浏览器';
    document.title = newTitle;
  } catch (err) {
    console.error('加载Markdown文件失败:', err);
    error.value = '无法加载文档，请检查文件是否存在或稍后重试。';
    markdownContent.value = '';
    document.title = 'Markdown 文档浏览器';
  } finally {
    loading.value = false;
  }
};

// 监听路由变化
watch(() => route.params.uuid, (newUuid) => {
  if (newUuid) {
    loadMarkdownFile(newUuid as string);
  }
}, {immediate: true});

// 计算属性
const displayState = computed(() => {
  if (loading.value) return 'loading';
  if (error.value) return 'error';
  if (markdownContent.value) return 'content';
  return 'notFound';
});

// 提取文档标题
const documentTitle = computed(() => {
  if (!markdownContent.value) return 'Markdown 文档浏览器';

  // 匹配以 # 开头的一级标题（确保前面没有其他字符）
  const titleMatch = markdownContent.value.match(/^#\s+(.+)$/m);
  return titleMatch ? titleMatch[1] : 'Markdown 文档浏览器';
});

// 从App.vue获取大纲可见性状态
const isOutlineVisible = ref(false);
onMounted(() => {
  // 监听自定义事件以获取大纲状态
  window.addEventListener('outline-visibility-changed', (event) => {
    if (event instanceof CustomEvent) {
      isOutlineVisible.value = event.detail.isVisible;
    }
  });
});
</script>

<template>
  <div class="app">
    <h1>{{ documentTitle }}</h1>
    <div v-if="displayState === 'loading'" class="loading">
      加载中...
    </div>
    <div v-else-if="displayState === 'error'" class="error">
      {{ error }}
    </div>
    <div v-else-if="displayState === 'content'" class="viewer">
      <MarkdownViewer :content="markdownContent"/>
      <!-- 大纲面板 -->
      <OutlinePanel
          :content="markdownContent"
          :isVisible="isOutlineVisible"
      />
    </div>
    <div v-else class="error">
      未找到指定的文档
    </div>
  </div>
</template>

<style scoped>
.app {
  width: 90%;
  max-width: none;
  margin: 0 auto;
  padding: 20px;
}

/* 小屏幕设备的响应式布局 */
@media (max-width: 768px) {
  .app {
    width: 95%;
    padding: 10px;
  }
}

h1 {
  text-align: center;
  color: var(--heading-color);
  margin-bottom: 30px;
}

.viewer {
  border: 1px solid var(--viewer-border);
  border-radius: 4px;
  background-color: var(--viewer-bg);
  box-shadow: 0 2px 4px var(--shadow-color);
  text-align: left;
  padding: 0;
}

.loading {
  text-align: center;
  padding: 2em;
  color: var(--text-color);
  font-size: 1.2em;
}

.error {
  text-align: center;
  padding: 2em;
  color: var(--error-color);
  font-size: 1.2em;
  background-color: var(--card-bg);
  border: 1px solid var(--error-color);
  border-radius: 4px;
}
</style> 