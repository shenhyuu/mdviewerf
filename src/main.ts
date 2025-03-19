import {createApp} from 'vue'
import RootApp from './RootApp.vue'
import router from './router'
import './style.css'

// 初始化主题
const initTheme = () => {
    // 从本地存储中获取主题设置
    const savedTheme = localStorage.getItem('theme');
    // 如果有保存的主题设置，使用它；否则检查系统默认
    if (savedTheme) {
        document.documentElement.classList.add(savedTheme === 'dark' ? 'dark-theme' : 'light-theme');
    } else {
        // 检查系统默认主题
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.add(isDarkMode ? 'dark-theme' : 'light-theme');
    }
};

initTheme();

const app = createApp(RootApp)
app.use(router)
app.mount('#app')
