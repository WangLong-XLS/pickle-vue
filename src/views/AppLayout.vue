<template>
  <div id="app">
    <el-container>
      <el-header>
        <img class="img" src="@/assets/logo.png" alt="" />
        <span class="span">小零食</span>

        <el-dropdown
          trigger="click"
          style="float: right"
          @command="handleCommand"
        >
          <span class="el-dropdown-link">
            {{ user.userName }}
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
      </el-header>

      <el-container>
        <el-aside width="250px">
          <!-- ✅ 加 v-if，防止空数据报错 -->
          <el-menu
            v-if="menuList.length > 0"
            :default-active="$route.path"
            router
            class="el-menu-aside"
          >
            <template v-for="item in menuList" :key="item.menuUuid">
              <!-- menuType=0：直接菜单项 -->
              <el-menu-item v-if="item.menuType === '0'" :index="item.menuPath">
                <el-icon><HomeFilled /></el-icon>
                <span>{{ item.menuName }}</span>
              </el-menu-item>

              <!-- menuType=1：子菜单分组 -->
              <el-sub-menu v-else :index="item.menuUuid">
                <template #title>
                  <el-icon><Location /></el-icon>
                  <span>{{ item.menuName }}</span>
                </template>
                <el-menu-item
                  v-for="child in item.sysMenuIn || []"
                  :key="child.menuUuid"
                  :index="child.menuPath"
                >
                  {{ child.menuName }}
                </el-menu-item>
              </el-sub-menu>
            </template>
          </el-menu>
          <!-- ✅ 菜单为空时显示加载中 -->
          <div v-else class="menu-loading">
            <el-skeleton :rows="5" animated />
          </div>
        </el-aside>

        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  HomeFilled,
  Location,
  Edit,
  SwitchButton,
  CircleClose,
  ArrowDown,
} from "@element-plus/icons-vue";
import request from "@/utils/request";
import type { MenuItem } from "@/types/sys/menu";

const router = useRouter();

const user = ref({
  userName: "",
  token: "",
  roleUuidIn: [],
});

/** 菜单列表 */
const menuList = ref<MenuItem[]>([]);

/** 根据角色加载菜单 */
async function loadMenus() {
  // ✅ 没有角色直接返回，不请求
  if (!user.value.roleUuidIn || user.value.roleUuidIn.length === 0) {
    menuList.value = [];
    return;
  }
  try {
    const data = {
      roleUuidIn: user.value.roleUuidIn,
    };
    const res = await request.post("/sysMenu/getMenusByRole", data);
    // ✅ 确保返回的是数组
    const result = res.data || res || [];
    menuList.value = Array.isArray(result) ? result : [];
  } catch (e) {
    console.error("加载菜单失败", e);
    menuList.value = []; // ✅ 失败时清空菜单
  }
}

/** 退出登录 */
const loginOut = () => {
  localStorage.removeItem("user");
  menuList.value = []; // ✅ 清空菜单
  router.push("/login");
};

/** 下拉菜单命令 */
const handleCommand = (command: string) => {
  if (command === "loginOut") loginOut();
  // 其他命令可继续扩展
};

/** 生命周期 */
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
.el-dropdown-link {
  cursor: pointer;
  color: aliceblue;
  display: flex;
  align-items: center;
  gap: 4px;
}

.img {
  width: 35px;
  position: relative;
  top: 10px;
  left: 10px;
}

.span {
  font-size: 20px;
  margin-left: 15px;
  color: aliceblue;
}

.el-header {
  background-color: #409eff;
  line-height: 60px;
}

.el-aside {
  color: #333;
  min-height: 100vh;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
}

.el-menu-aside {
  width: 250px;
}

/* ✅ 新增：菜单加载占位样式 */
.menu-loading {
  padding: 20px;
}
</style>

<style>
.el-dialog {
  border-radius: 15px !important;
  overflow: hidden !important;
}
.el-dialog__header {
  border-radius: 15px 15px 0 0 !important;
}
.el-dialog__footer {
  border-radius: 0 0 15px 15px !important;
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
