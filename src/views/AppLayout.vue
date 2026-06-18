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
          <el-menu :default-active="$route.path" router class="el-menu-aside">
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
                  v-for="child in item.sysMenuIn"
                  :key="child.menuUuid"
                  :index="child.menuPath"
                >
                  {{ child.menuName }}
                </el-menu-item>
              </el-sub-menu>
            </template>
          </el-menu>
        </el-aside>

        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
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
import { MenuItem, SysMenu } from "@/types/menu";

const user = ref({
  userName: "",
  token: "",
  roleUuidIn: [],
});

onMounted(() => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      const parsed = JSON.parse(userStr);
      user.value = parsed;
      if (parsed.roleUuidIn) loadMenus();
    } catch (e) {
      console.error("解析用户信息失败", e);
    }
  }
});

/** 根据角色加载菜单 */
const menuList = ref<MenuItem[]>([]);
async function loadMenus() {
  if (!user.value.roleUuidIn) return;
  try {
    const data = {
      roleUuidIn: user.value.roleUuidIn,
    };
    const res = await request.post("/sysMenu/getMenusByRole", data);
    menuList.value = res.data || res || [];
  } catch (e) {
    console.error("加载菜单失败", e);
  }
}

const handleCommand = (command: string) => {
  if (command === "loginOut") loginOut();
};

const router = useRouter();
const loginOut = () => {
  localStorage.removeItem("user");
  router.push("/login");
};
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
