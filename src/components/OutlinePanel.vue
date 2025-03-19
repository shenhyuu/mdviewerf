<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// 接收参数
const props = defineProps<{
  content: string;
  isVisible: boolean;
}>();

// 定义事件
const emit = defineEmits<{
  (e: 'update:isVisible', value: boolean): void;
}>();

// 大纲项目的类型定义
interface OutlineItem {
  level: number;
  text: string;
  id: string;
  children: OutlineItem[];
}

const outlineItems = ref<OutlineItem[]>([]);
const outlinePanelRef = ref<HTMLElement | null>(null);

// 渲染LaTeX公式
const renderLatex = (text: string): string => {
  return text.replace(/\$([^\$]+?)\$/g, (match, formula) => {
    try {
      return katex.renderToString(formula.trim(), {
        displayMode: false,
        throwOnError: false,
        trust: true
      });
    } catch (error) {
      console.error('LaTeX行内公式渲染错误:', error);
      return match;
    }
  });
};

// 提取标题并生成大纲
const generateOutline = (content: string) => {
  // 匹配所有标题（# 到 ######）
  const headingRegex = /^(#{1,6})\s+(.+?)(?:\s*{#([^}]+)})?$/gm;
  const headings: { level: number; text: string; id: string }[] = [];
  
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    
    // 使用与MarkdownViewer一致的ID生成方法
    const id = match[3] || text.toLowerCase()
      .replace(/<[^>]*>/g, '') // 移除HTML标签
      .replace(/[^\w\u4e00-\u9fa5]+/g, '-') // 非字母数字中文字符替换为短横线
      .replace(/^-+|-+$/g, ''); // 去除首尾短横线
    
    headings.push({ level, text, id });
  }
  
  // 构建层级结构
  const result: OutlineItem[] = [];
  const stack: OutlineItem[] = [];
  
  headings.forEach(heading => {
    const item: OutlineItem = {
      level: heading.level,
      text: heading.text,
      id: heading.id,
      children: []
    };
    
    // 清理栈，直到找到上一级标题或栈空
    while (stack.length > 0 && stack[stack.length - 1].level >= item.level) {
      stack.pop();
    }
    
    if (stack.length === 0) {
      // 顶级标题
      result.push(item);
    } else {
      // 子标题，添加到父标题的children中
      stack[stack.length - 1].children.push(item);
    }
    
    stack.push(item);
  });
  
  return result;
};

// 监听内容变化，更新大纲
watch(() => props.content, (newContent) => {
  if (newContent) {
    outlineItems.value = generateOutline(newContent);
  } else {
    outlineItems.value = [];
  }
}, { immediate: true });

// 点击标题跳转
const scrollToHeading = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }
};

// 点击大纲外部关闭大纲
const handleClickOutside = (event: MouseEvent) => {
  if (props.isVisible && outlinePanelRef.value && !outlinePanelRef.value.contains(event.target as Node)) {
    // 使用Vue的事件系统通知父组件
    emit('update:isVisible', false);
  }
};

// 组件挂载时添加点击事件监听
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

// 组件卸载前移除事件监听
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <transition name="slide">
    <div class="outline-panel" v-if="isVisible" ref="outlinePanelRef">
      <div class="outline-header">
        <h3>文档大纲</h3>
      </div>
      <div class="outline-content">
        <div v-if="outlineItems.length === 0" class="empty-outline">
          没有找到标题
        </div>
        <div v-else class="outline-tree">
          <ul class="outline-list">
            <li v-for="item in outlineItems" :key="item.id">
              <a 
                :href="`#${item.id}`" 
                :class="`heading-level-${item.level}`"
                @click.prevent="scrollToHeading(item.id)"
                v-html="renderLatex(item.text)"
              ></a>
              <!-- 递归渲染子级 -->
              <ul class="outline-list" v-if="item.children.length > 0">
                <li v-for="child in item.children" :key="child.id">
                  <a 
                    :href="`#${child.id}`" 
                    :class="`heading-level-${child.level}`"
                    @click.prevent="scrollToHeading(child.id)"
                    v-html="renderLatex(child.text)"
                  ></a>
                  <!-- 二级嵌套 -->
                  <ul class="outline-list" v-if="child.children.length > 0">
                    <li v-for="subChild in child.children" :key="subChild.id">
                      <a 
                        :href="`#${subChild.id}`" 
                        :class="`heading-level-${subChild.level}`"
                        @click.prevent="scrollToHeading(subChild.id)"
                        v-html="renderLatex(subChild.text)"
                      ></a>
                      <!-- 三级嵌套 -->
                      <ul class="outline-list" v-if="subChild.children.length > 0">
                        <li v-for="deepChild in subChild.children" :key="deepChild.id">
                          <a 
                            :href="`#${deepChild.id}`" 
                            :class="`heading-level-${deepChild.level}`"
                            @click.prevent="scrollToHeading(deepChild.id)"
                            v-html="renderLatex(deepChild.text)"
                          ></a>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.outline-panel {
  position: fixed;
  top: 20px;
  left: 100px;
  width: 280px;
  max-height: calc(100vh - 50px);
  background-color: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  box-shadow: 0 4px 15px var(--shadow-color);
  display: flex;
  flex-direction: column;
  z-index: 99;
  overflow: hidden;
}

.outline-header {
  padding: 8px 16px;
  border-bottom: 1px solid var(--card-border);
  height: 40px;
  display: flex;
  align-items: center;
}

.outline-header h3 {
  margin: 0;
  font-size: 1em;
  color: var(--heading-color);
  font-weight: 500;
}

.outline-content {
  padding: 12px;
  overflow-y: auto;
  max-height: calc(100vh - 100px);
}

.empty-outline {
  padding: 16px;
  text-align: center;
  color: var(--text-color);
  opacity: 0.7;
}

.outline-list {
  list-style: none;
  padding-left: 0;
  margin: 0;
}

.outline-list li {
  margin-bottom: 6px;
}

.outline-list ul {
  padding-left: 16px;
  margin-top: 6px;
}

a {
  text-decoration: none;
  color: var(--text-color);
  display: block;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

a:hover {
  background-color: rgba(var(--primary-color-rgb), 0.1);
  color: var(--link-color);
}

.heading-level-1 {
  font-weight: 600;
  font-size: 1.1em;
}

.heading-level-2 {
  font-weight: 500;
}

.heading-level-3 {
  font-weight: 400;
  font-size: 0.95em;
}

.heading-level-4,
.heading-level-5,
.heading-level-6 {
  font-weight: 400;
  font-size: 0.9em;
  opacity: 0.85;
}

/* 动画效果 */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

/* 移动设备适配 */
@media (max-width: 768px) {
  .outline-panel {
    width: 240px;
    left: 85px;
    top: 15px;
  }
  
  .outline-header {
    height: 35px;
    padding: 6px 12px;
  }
}

/* 添加LaTeX公式样式 */
:deep(.katex) {
  font-size: 1em;
  vertical-align: middle;
}

:deep(.katex-html) {
  white-space: nowrap;
}
</style> 