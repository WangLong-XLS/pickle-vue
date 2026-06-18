import { createRouter, createWebHistory } from "vue-router";
import AppLayout from "@/views/AppLayout.vue";
import LoginView from "@/views/login/LoginView.vue";
import HomeView from "@/views/hom/HomeView.vue";
import SysUserView from "@/views/sys/SysUserView.vue";
import SysRoleView from "@/views/sys/SysRoleView.vue";
import SysAdOrgView from "@/views/sys/SysAdOrgView.vue";
import WxCdCdxxView from "@/views/venue/WxCdCdxxView.vue";
import WxCdCcxxView from "@/views/venue/WxCdCcxxView.vue";
import WxCdYyjlView from "@/views/venue/WxCdYyjlView.vue";
import WxUserView from "@/views/member/WxUserView.vue";
import SysMenuView from "@/views/sys/SysMenuView.vue";

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
      {
        path: "sysRole",
        name: "sysRole",
        component: SysRoleView,
      },
      {
        path: "sysAdOrg",
        name: "sysAdOrg",
        component: SysAdOrgView,
      },
      {
        path: "wxCdCdxx",
        name: "wxCdCdxx",
        component: WxCdCdxxView,
      },
      {
        path: "wxCdCcxx",
        name: "wxCdCcxx",
        component: WxCdCcxxView,
      },
      {
        path: "wxCdYyjl",
        name: "wxCdYyjl",
        component: WxCdYyjlView,
      },
      {
        path: "wxUser",
        name: "wxUser",
        component: WxUserView,
      },
      {
        path: "sysMenu",
        name: "sysMenu",
        component: SysMenuView,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
