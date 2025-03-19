<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const contents = ref<Record<string, string>>({});
const loading = ref(true);
const error = ref<string | null>(null);

// 加载目录内容
const loadContents = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await fetch('http://127.0.0.1:8080/contents');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    contents.value = await response.json();
  } catch (err) {
    console.error('加载目录失败:', err);
    error.value = '无法加载目录，请稍后重试。';
  } finally {
    loading.value = false;
  }
};

// 跳转到文档页面
const navigateToDocument = (uuid: string) => {
  router.push(`/documents/${uuid}`);
};

onMounted(() => {
  loadContents();
});
</script>

<template>
  <div class="contents">
    <h1>文档目录</h1>
    
    <div v-if="loading" class="loading">
      加载中...
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else-if="Object.keys(contents).length === 0" class="empty">
      暂无可用的文档
    </div>
    
    <div v-else class="document-list">
      <div
        v-for="(uuid, title) in contents"
        :key="uuid"
        class="document-item"
        @click="navigateToDocument(uuid)"
      >
        <span class="document-title">{{ title }}</span>
        <span class="arrow">→</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contents {
  width: 90%;
  max-width: none;
  margin: 0 auto;
  padding: 20px;
}

/* 小屏幕设备的响应式布局 */
@media (max-width: 768px) {
  .contents {
    width: 95%;
    padding: 10px;
  }
}

h1 {
  text-align: center;
  color: var(--heading-color);
  margin-bottom: 40px;
}

.document-list {
  display: grid;
  gap: 16px;
  padding: 20px;
}

.document-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.document-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow-color);
  border-color: var(--primary-color);
}

.document-title {
  font-size: 1.1em;
  color: var(--text-color);
}

.arrow {
  color: var(--text-color);
  font-size: 1.2em;
  transition: transform 0.3s ease;
}

.document-item:hover .arrow {
  transform: translateX(5px);
  color: var(--primary-color);
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

.empty {
  text-align: center;
  padding: 2em;
  color: var(--text-color);
  font-size: 1.2em;
  background-color: var(--card-bg);
  border-radius: 4px;
}
</style> 