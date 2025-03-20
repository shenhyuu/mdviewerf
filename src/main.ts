import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'

// 初始化主题
const initTheme = () => {
    // 从本地存储中获取主题设置
    const savedTheme = localStorage.getItem('theme');
    // 如果有保存的主题设置，使用它；否则检查系统默认
    if (savedTheme) {
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark-theme');
            document.documentElement.classList.remove('light-theme');
        } else {
            document.documentElement.classList.add('light-theme');
            document.documentElement.classList.remove('dark-theme');
        }
    } else {
        // 检查系统默认主题
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isDarkMode) {
            document.documentElement.classList.add('dark-theme');
            document.documentElement.classList.remove('light-theme');
        } else {
            document.documentElement.classList.add('light-theme');
            document.documentElement.classList.remove('dark-theme');
        }
    }
};

initTheme();

const app = createApp(App)
app.use(router)
app.mount('#app')
