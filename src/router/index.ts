import { createRouter, createWebHistory } from "vue-router";
import AppLayout from "@/views/AppLayout.vue";
import LoginView from "@/views/login/LoginView.vue";
import HomeView from "@/views/hom/HomeView.vue";
import SysUserView from "@/views/sys/SysUserView.vue";

// 确保所有组件都存在
const routes = [
  {
    path: "/login",
    name: "login",
    component: LoginView,
  },
  {
    path: "/",
    component: AppLayout,
    redirect: "/home",
    children: [
      {
        path: "home",
        name: "home",
        component: HomeView,
      },
      {
        path: "sysUser",
        name: "sysUser",
        component: SysUserView,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
