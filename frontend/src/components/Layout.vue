<template>
  <div class="layout">
    <header class="header" v-if="showHeader">
      <slot name="header">
        <h1 class="title">{{ title }}</h1>
      </slot>
    </header>
    <main class="main">
      <slot></slot>
    </main>
    <footer class="footer" v-if="showFooter">
      <slot name="footer"></slot>
    </footer>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string;
  showHeader?: boolean;
  showFooter?: boolean;
}

withDefaults(defineProps<Props>(), {
  title: '小卡拼车系统',
  showHeader: true,
  showFooter: false,
});
</script>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.header {
  background-color: #fff;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
  text-align: center;
}

.main {
  flex: 1;
  padding: 16px;
  max-width: 100%;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.footer {
  background-color: #fff;
  padding: 16px;
  border-top: 1px solid #eee;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .header {
    padding: 12px 16px;
  }

  .title {
    font-size: 16px;
  }

  .main {
    padding: 12px;
  }
}

/* 微信浏览器安全区域适配 */
@supports (padding: max(0px)) {
  .main {
    padding-bottom: max(16px, env(safe-area-inset-bottom));
  }
}
</style>
