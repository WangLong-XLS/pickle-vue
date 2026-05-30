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
              <el-dropdown-item command="changePwd" icon="Edit"
                >修改密码</el-dropdown-item
              >
              <el-dropdown-item command="loginOut" icon="SwitchButton"
                >退出登录</el-dropdown-item
              >
              <el-dropdown-item command="logout" icon="CircleClose"
                >注销</el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>

      <el-container>
        <el-aside width="250px">
          <el-menu :default-active="$route.path" router class="el-menu-aside">
            <el-menu-item index="/home">
              <el-icon><HomeFilled /></el-icon>
              <span>首页</span>
            </el-menu-item>

            <el-sub-menu index="2">
              <template #title>
                <el-icon><Location /></el-icon>
                <span>系统管理</span>
              </template>
              <el-menu-item-group>
                <el-menu-item index="/sysUser">用户信息</el-menu-item>
                <el-menu-item index="/sysRole">角色信息</el-menu-item>
                <el-menu-item index="/sysAdOrg">机构管理</el-menu-item>
              </el-menu-item-group>
            </el-sub-menu>

            <el-sub-menu index="3">
              <template #title>
                <el-icon><Location /></el-icon>
                <span>场地管理</span>
              </template>
              <el-menu-item-group>
                <el-menu-item index="/wxCdCdxx">场地信息</el-menu-item>
                <el-menu-item index="/wxCdCcxx">场次信息</el-menu-item>
                <el-menu-item index="/wxCdYyjl">场地预约记录</el-menu-item>
              </el-menu-item-group>
            </el-sub-menu>

            <el-sub-menu index="4">
              <template #title>
                <el-icon><Location /></el-icon>
                <span>家族管理</span>
              </template>
              <el-menu-item-group>
                <el-menu-item index="/rsJzJbxx">家族基本信息</el-menu-item>
                <el-menu-item index="/rsZyJbxx">族员基本信息</el-menu-item>
                <el-menu-item index="/rsZjjl">获奖记录信息</el-menu-item>
                <el-menu-item index="/rsSyjl">深渊记录信息</el-menu-item>
              </el-menu-item-group>
            </el-sub-menu>
          </el-menu>
        </el-aside>

        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

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

.el-header,
.el-footer {
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

.el-sub-menu {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
}
</style>

<style>
/* 全局样式 - 确保对话框圆角和居中生效 */
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

const router = useRouter();

const user = ref({
  userName: "",
  token: "",
});

const handleCommand = (command: string) => {
  if (command === "loginOut") {
    loginOut();
  }
};

const loginOut = () => {
  localStorage.removeItem("user");
  router.push("/login");
};

onMounted(() => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      user.value = JSON.parse(userStr);
    } catch (e) {
      console.error("解析用户信息失败", e);
    }
  }
});
</script>
