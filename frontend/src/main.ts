import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';
import './styles/responsive.css';
import { useUserStore } from './stores/user';
import { apiClient } from './services/api';

// Vant UI组件库
import Vant from 'vant';
import 'vant/lib/index.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(Vant);

// 初始化默认用户（从localStorage或使用默认用户ID=1）
const userStore = useUserStore();

// 尝试从localStorage获取用户信息
const savedUser = localStorage.getItem('currentUser');
if (savedUser) {
  try {
    userStore.setCurrentUser(JSON.parse(savedUser));
  } catch (error) {
    console.error('Failed to load user from localStorage:', error);
  }
}

// 如果没有保存的用户，尝试从API获取默认用户（ID=1）
if (!userStore.currentUser) {
  // 异步获取用户，但不阻塞应用启动
  apiClient.get<any>('/users/1').then((response) => {
    if (response.status === 'success' && response.data) {
      userStore.setCurrentUser(response.data);
      localStorage.setItem('currentUser', JSON.stringify(response.data));
    }
  }).catch((error) => {
    console.error('Failed to fetch default user:', error);
    // 如果API失败，创建一个临时用户对象
    userStore.setCurrentUser({
      id: 1,
      username: 'admin',
      display_name: '默认车主',
      user_type: 'owner',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  });
}

app.mount('#app');
