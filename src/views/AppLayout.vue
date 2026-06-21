<template>
  <div id="app-layout">
    <el-container class="layout-container">
      <!-- ========== Header ========== -->
      <el-header class="layout-header">
        <div class="header-left">
          <img class="header-logo" src="@/assets/logo.png" alt="Logo" />
          <span class="header-title">小零食后台管理</span>
        </div>
        <div class="header-right">
          <el-dropdown trigger="click" @command="handleCommand">
            <span class="user-dropdown">
              <el-icon class="user-icon"><UserFilled /></el-icon>
              <span class="user-name">{{ user.userName }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="changePwd" :icon="Edit"
                  >修改密码</el-dropdown-item
                >
                <el-dropdown-item command="loginOut" :icon="SwitchButton"
                  >退出登录</el-dropdown-item
                >
                <el-dropdown-item command="logout" :icon="CircleClose"
                  >注销</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-container class="layout-body">
        <!-- ========== Sidebar ========== -->
        <el-aside class="layout-sidebar">
          <!-- 首页 - 固定显示 -->
          <div class="sidebar-section">
            <el-menu
              :default-active="activeMenu"
              router
              class="sidebar-menu sidebar-menu-home"
            >
              <el-menu-item index="/home">
                <el-icon><HomeFilled /></el-icon>
                <span>首页</span>
              </el-menu-item>
            </el-menu>
          </div>

          <!-- 动态菜单区域 -->
          <div class="sidebar-section sidebar-dynamic">
            <div v-if="menuList.length > 0" class="sidebar-inner">
              <el-menu :default-active="activeMenu" router class="sidebar-menu">
                <!-- 功能菜单：有 menuPath 的菜单项（可跳转页面） -->
                <template v-if="funcMenus.length > 0">
                  <el-menu-item
                    v-for="item in funcMenus"
                    :key="item.menuUuid"
                    :index="item.menuPath || ''"
                  >
                    <span>{{ item.menuName }}</span>
                  </el-menu-item>
                </template>

                <!-- 分类菜单：有子菜单的一级菜单（无页面，仅分组） -->
                <template v-if="groupMenus.length > 0">
                  <template v-for="item in groupMenus" :key="item.menuUuid">
                    <el-sub-menu :index="item.menuUuid">
                      <template #title>
                        <el-icon>
                          <component :is="getIcon(item.menuIcon)" />
                        </el-icon>
                        <span>{{ item.menuName }}</span>
                      </template>
                      <el-menu-item
                        v-for="child in item.sysMenuIn || []"
                        :key="child.menuUuid"
                        :index="child.menuPath || ''"
                      >
                        {{ child.menuName }}
                      </el-menu-item>
                    </el-sub-menu>
                  </template>
                </template>
              </el-menu>
            </div>

            <!-- 加载骨架 -->
            <div v-else class="sidebar-loading">
              <el-skeleton :rows="6" animated />
            </div>
          </div>
        </el-aside>

        <!-- ========== Main Content ========== -->
        <el-main class="layout-main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  HomeFilled,
  Edit,
  SwitchButton,
  CircleClose,
  ArrowDown,
  UserFilled,
  Operation,
  Grid,
  Folder,
  Menu,
} from "@element-plus/icons-vue";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import request from "@/utils/request";

export interface MenuItem {
  menuUuid: string;
  menuName: string;
  menuPath?: string;
  menuIcon?: string;
  menuType: string; // '0'=菜单项, '1'=子菜单分组
  sysMenuIn?: MenuItem[];
}

const router = useRouter();
const route = useRoute();

const user = ref({
  userName: "",
  token: "",
  roleUuidIn: [] as string[],
});

const menuList = ref<MenuItem[]>([]);

// 当前激活菜单
const activeMenu = computed(() => {
  // 子路由匹配父级 sub-menu
  return route.path;
});

/** 功能菜单：menuType='0' 的菜单项（有路由，可跳转页面），排除首页 */
const funcMenus = computed(() =>
  menuList.value.filter(
    (m) => m.menuType === "01" && m.menuPath && m.menuPath !== "/home"
  )
);

/** 分类菜单：menuType='1' 的菜单项（无页面，有子菜单，仅作分组） */
const groupMenus = computed(() =>
  menuList.value.filter((m) => m.menuType === "02")
);

/** 图标解析：从 Element Plus 全量图标中按名称查找 */
const getIcon = (iconName?: string) => {
  if (!iconName) return Menu;
  // 尝试多种命名格式：HomeFilled / home-filled / home_filled / homefilled
  const normalized = iconName.trim();
  // 1. 直接匹配 PascalCase（如 "HomeFilled"）
  if (ElementPlusIconsVue[normalized]) return ElementPlusIconsVue[normalized];
  // 2. 转换成 PascalCase（如 "home-filled" → "HomeFilled"）
  const pascal = normalized
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\s+/g, "");
  if (ElementPlusIconsVue[pascal]) return ElementPlusIconsVue[pascal];
  // 3. 全小写匹配
  const lower = normalized.toLowerCase();
  const key = Object.keys(ElementPlusIconsVue).find(
    (k) => k.toLowerCase() === lower
  );
  if (key) return ElementPlusIconsVue[key];
  // 4. 找不到用默认图标
  return Menu;
};

/** 加载菜单 */
async function loadMenus() {
  if (!user.value.roleUuidIn || user.value.roleUuidIn.length === 0) {
    menuList.value = [];
    return;
  }
  try {
    const res = await request.post("/sysMenu/queryTreeList", {
      roleUuidIn: user.value.roleUuidIn,
    });
    // 兼容两种返回格式：{ code:201, data: [...] } 或直接 [...]
    const result = res?.data ?? res ?? [];
    menuList.value = Array.isArray(result) ? result : [];
  } catch (e: any) {
    console.error("加载菜单失败", e);
    menuList.value = [];
  }
}

/** 退出登录 */
const loginOut = () => {
  localStorage.removeItem("user");
  menuList.value = [];
  router.push("/login");
};

/** 下拉菜单指令 */
const handleCommand = (command: string) => {
  if (command === "loginOut") loginOut();
};

/** 初始化 */
onMounted(() => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      const parsed = JSON.parse(userStr);
      user.value = parsed;
      if (parsed.roleUuidIn && parsed.roleUuidIn.length > 0) {
        loadMenus();
      }
    } catch (e) {
      console.error("解析用户信息失败", e);
    }
  }
});
</script>

<style scoped>
/* ==================== 容器 ==================== */
#app-layout {
  height: 100vh;
  overflow: hidden;
}

.layout-container {
  height: 100vh;
}

/* ==================== Header ==================== */
.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 56px !important;
  background: linear-gradient(135deg, #1a73e8 0%, #4a90d9 50%, #6db3f2 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-logo {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  object-fit: contain;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 1px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: #fff;
  padding: 6px 14px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.15);
  transition: background 0.3s;
  font-size: 14px;
}

.user-dropdown:hover {
  background: rgba(255, 255, 255, 0.25);
}

.user-icon {
  font-size: 16px;
}

.user-name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ==================== Body ==================== */
.layout-body {
  height: calc(100vh - 56px);
}

/* ==================== Sidebar ==================== */
.layout-sidebar {
  width: 240px !important;
  min-width: 240px;
  background: #fff;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.04);
}

.sidebar-section {
  border-bottom: 1px solid #f0f0f0;
}

.sidebar-dynamic {
  flex: 1;
  overflow: hidden;
  border-bottom: none;
}

.sidebar-inner {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-inner::-webkit-scrollbar {
  width: 4px;
}

.sidebar-inner::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 2px;
}

/* 首页菜单 */
.sidebar-menu-home {
  border-right: none !important;
}

.sidebar-menu-home .el-menu-item {
  height: 48px;
  line-height: 48px;
  font-size: 15px;
  font-weight: 600;
  color: #1a73e8;
}

.sidebar-menu-home .el-menu-item.is-active {
  background: linear-gradient(90deg, #e8f0fe 0%, #fff 100%);
  color: #1a73e8;
  border-right: 3px solid #1a73e8;
}

/* 动态菜单 */
.sidebar-menu {
  border-right: none !important;
}

/* 菜单分区标题 */
.menu-section-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 14px 20px 6px;
  font-size: 12px;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: default;
  pointer-events: none;
}

.menu-section-header .el-icon {
  font-size: 14px;
}

/* 菜单项 */
.sidebar-menu .el-menu-item {
  height: 42px;
  line-height: 42px;
  margin: 2px 8px;
  border-radius: 8px;
  font-size: 14px;
  color: #555;
  transition: all 0.2s;
}

.sidebar-menu .el-menu-item:hover {
  background: #f5f7fa;
  color: #1a73e8;
}

.sidebar-menu .el-menu-item.is-active {
  background: linear-gradient(90deg, #e8f0fe 0%, #f0f4ff 100%);
  color: #1a73e8;
  font-weight: 600;
  border-radius: 8px;
}

/* 子菜单标题 */
.sidebar-menu .el-sub-menu {
  margin: 0 8px;
}

.sidebar-menu .el-sub-menu .el-sub-menu__title {
  height: 42px;
  line-height: 42px;
  border-radius: 8px;
  font-size: 14px;
  color: #555;
  transition: all 0.2s;
}

.sidebar-menu .el-sub-menu .el-sub-menu__title:hover {
  background: #f5f7fa;
  color: #1a73e8;
}

/* 子菜单项 */
.sidebar-menu .el-sub-menu .el-menu-item {
  height: 38px;
  line-height: 38px;
  padding-left: 56px !important;
  font-size: 13px;
  color: #666;
  margin: 1px 4px;
}

.sidebar-menu .el-sub-menu .el-menu-item:hover {
  color: #1a73e8;
  background: #f5f7fa;
}

.sidebar-menu .el-sub-menu .el-menu-item.is-active {
  background: linear-gradient(90deg, #e8f0fe 0%, #f0f4ff 100%);
  color: #1a73e8;
  font-weight: 500;
}

/* 加载 */
.sidebar-loading {
  padding: 24px 16px;
}

/* ==================== Main ==================== */
.layout-main {
  background: #f5f7fa;
  padding: 20px;
  overflow-y: auto;
  height: 100%;
}

.layout-main::-webkit-scrollbar {
  width: 6px;
}

.layout-main::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 3px;
}
</style>

<style>
/* 全局 Dialog 圆角 */
.el-dialog {
  border-radius: 12px !important;
  overflow: hidden !important;
}
.el-dialog__header {
  border-radius: 12px 12px 0 0 !important;
}
.el-dialog__footer {
  border-radius: 0 0 12px 12px !important;
}
.el-overlay-dialog {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}
.el-dialog {
  margin: 0 !important;
}
</style>
