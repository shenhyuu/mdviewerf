<script setup lang="ts">
import {ref, onMounted, watch, onBeforeUnmount} from 'vue';
import {marked} from 'marked';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import OutlinePanel from './OutlinePanel.vue';

const props = defineProps<{
  content: string;
}>();

const htmlContent = ref('');
const isOutlineVisible = ref(false);

interface ProtectedContent {
  content: string;
  blocks: string[];
}

// 监听大纲可见性变化的事件
const handleOutlineVisibilityChange = (event: CustomEvent) => {
  isOutlineVisible.value = event.detail.isVisible;
};

// 保护LaTeX公式
const protectLatex = (content: string): ProtectedContent => {
  const blocks: string[] = [];

  // 临时替换块级公式
  let processedContent = content.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
    blocks.push(match);
    return `@@BLOCK${blocks.length - 1}@@`;
  });

  // 临时替换行内公式
  processedContent = processedContent.replace(/\$([^\$]+?)\$/g, (match, formula) => {
    blocks.push(match);
    return `@@INLINE${blocks.length - 1}@@`;
  });

  return {content: processedContent, blocks};
};

// 恢复LaTeX公式
const restoreLatex = (content: string, blocks: string[]): string => {
  // 恢复所有公式
  return content.replace(/@@(?:BLOCK|INLINE)(\d+)@@/g, (match, index) => {
    return blocks[parseInt(index)];
  });
};

// 处理LaTeX公式
const renderLatex = (content: string): string => {
  // 处理块级公式
  content = content.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
    try {
      return katex.renderToString(formula.trim(), {
        displayMode: true,
        throwOnError: false,
        trust: true
      });
    } catch (error) {
      console.error('LaTeX块级公式渲染错误:', error);
      return match;
    }
  });

  // 处理行内公式
  return content.replace(/\$([^\$]+?)\$/g, (match, formula) => {
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

// 配置marked选项
const renderer = {
  code(code: string, language: string | undefined) {
    const validLanguage = hljs.getLanguage(language || '') ? language : 'plaintext';
    const highlightedCode = validLanguage ?
        hljs.highlight(code, {language: validLanguage}).value :
        hljs.highlightAuto(code).value;
    return `<pre><code class="hljs language-${validLanguage}">${highlightedCode}</code></pre>`;
  },

  // 自定义标题渲染，添加ID
  heading(text: string, level: number) {
    // 从文本生成ID（移除特殊字符，用短横线替换空格）
    const id = text.toLowerCase()
        .replace(/<[^>]*>/g, '') // 移除HTML标签
        .replace(/[^\w\u4e00-\u9fa5]+/g, '-') // 非字母数字中文字符替换为短横线
        .replace(/^-+|-+$/g, ''); // 去除首尾短横线

    return `<h${level} id="${id}">${text}</h${level}>`;
  }
};

marked.use({
  renderer,
  breaks: true,
  gfm: true
});

// 渲染Markdown内容
const renderMarkdown = async () => {
  try {
    // 1. 保护LaTeX公式
    const {content: protectedContent, blocks} = protectLatex(props.content);

    // 2. 渲染Markdown
    const markedHtml = await marked.parse(protectedContent);

    // 3. 恢复LaTeX公式
    const restoredHtml = restoreLatex(markedHtml, blocks);

    // 4. 渲染LaTeX公式
    htmlContent.value = renderLatex(restoredHtml);
  } catch (error) {
    console.error('Markdown渲染错误:', error);
  }
};

// 监听content变化
watch(() => props.content, () => {
  renderMarkdown();
});

// 在组件挂载后监听大纲可见性事件
onMounted(() => {
  renderMarkdown();
  window.addEventListener('outline-visibility-changed', handleOutlineVisibilityChange as EventListener);
});

// 在组件卸载前移除事件监听器
onBeforeUnmount(() => {
  window.removeEventListener('outline-visibility-changed', handleOutlineVisibilityChange as EventListener);
});
</script>

<template>
  <div class="markdown-container">
    <div class="markdown-viewer" v-html="htmlContent"></div>
    <OutlinePanel
        :content="content"
        v-model:isVisible="isOutlineVisible"
    />
  </div>
</template>

<style scoped>
.markdown-container {
  position: relative;
  width: 100%;
}

.markdown-viewer {
  width: 80%;
  margin: 0 auto;
  padding: 0 20px;
  padding-top: min(calc(10vw * 0.9), 80px); /* 限制最大顶部边距 */
  padding-bottom: min(calc(10vw * 0.9), 80px); /* 限制最大底部边距 */
  line-height: 1.4; /* 将行距从1.6减小到1.4 */
  text-align: left;
  box-sizing: border-box;
}

/* 小屏幕设备的响应式布局 */
@media (max-width: 768px) {
  .markdown-viewer {
    width: 95%;
    padding: 0 15px;
    padding-top: calc(2.5vw * 0.9);
    padding-bottom: calc(2.5vw * 0.9);
  }
}

.markdown-viewer :deep(h1) {
  font-size: 2em;
  margin-bottom: 0.8em;
  scroll-margin-top: 80px; /* 添加滚动边距 */
}

.markdown-viewer :deep(h2) {
  font-size: 1.5em;
  margin-bottom: 0.7em;
  margin-top: 1.3em;
  scroll-margin-top: 80px; /* 添加滚动边距 */
}

.markdown-viewer :deep(h3) {
  font-size: 1.3em;
  margin-bottom: 0.5em;
  margin-top: 1em;
  scroll-margin-top: 80px; /* 添加滚动边距 */
}

.markdown-viewer :deep(h4),
.markdown-viewer :deep(h5),
.markdown-viewer :deep(h6) {
  scroll-margin-top: 80px; /* 添加滚动边距 */
}

.markdown-viewer :deep(p) {
  margin-bottom: 0.8em; /* 减小段落间距 */
  text-align: left;
}

.markdown-viewer :deep(pre) {
  background-color: #f6f8fa;
  padding: 14px; /* 减小内边距 */
  border-radius: 6px;
  overflow-x: auto;
  margin: 0.8em 0; /* 减小外边距 */
  max-width: 100%;
}

.markdown-viewer :deep(code) {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.3; /* 减小代码行距 */
}

.markdown-viewer :deep(blockquote) {
  border-left: 4px solid #dfe2e5;
  padding-left: 1em;
  color: #6a737d;
  margin: 0.8em 0; /* 减小外边距 */
  line-height: 1.3; /* 减小引用内容行距 */
}

.markdown-viewer :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 0.8em; /* 减小表格下方间距 */
  overflow-x: auto;
  display: block;
  max-width: 100%;
}

.markdown-viewer :deep(th),
.markdown-viewer :deep(td) {
  border: 1px solid #dfe2e5;
  padding: 6px 13px;
}

.markdown-viewer :deep(th) {
  background-color: #f6f8fa;
}

.markdown-viewer :deep(.katex-display) {
  margin: 1em 0;
  overflow-x: auto;
  overflow-y: hidden;
}

.markdown-viewer :deep(.katex) {
  font-size: 1.1em;
}

.markdown-viewer :deep(ul),
.markdown-viewer :deep(ol) {
  padding-left: 1.5em;
  margin: 0.8em 0;
}

.markdown-viewer :deep(li) {
  margin-bottom: 0.3em;
  line-height: 1.4;
}

.markdown-viewer :deep(li > ul),
.markdown-viewer :deep(li > ol) {
  margin: 0.3em 0;
}
</style> 