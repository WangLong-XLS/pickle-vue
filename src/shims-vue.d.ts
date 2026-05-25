/* eslint-disable */
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// 声明 vue-router 模块 - 解决 TS7016 错误
declare module 'vue-router';

// 添加 Element Plus 的类型声明
declare module 'element-plus';
declare module 'element-plus/dist/index.css';
