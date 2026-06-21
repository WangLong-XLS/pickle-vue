<template>
  <div class="home-page">
    <!-- 顶部欢迎卡片 -->
    <div class="welcome-card">
      <div class="welcome-left">
        <h1 class="welcome-title">欢迎回来 👋</h1>
        <p class="welcome-subtitle">场地预约小程序后台管理系统</p>
      </div>
      <div class="welcome-right">
        <div class="stat-item">
          <span class="stat-value">{{ today }}</span>
          <span class="stat-label">今日日期</span>
        </div>
      </div>
    </div>

    <!-- 快捷入口卡片 -->
    <div class="card-grid">
      <div class="info-card">
        <div class="card-icon card-icon-blue">
          <el-icon size="28"><Location /></el-icon>
        </div>
        <div class="card-body">
          <h3>场地管理</h3>
          <p>管理场地信息、场地层次、预约记录</p>
        </div>
      </div>

      <div class="info-card">
        <div class="card-icon card-icon-green">
          <el-icon size="28"><User /></el-icon>
        </div>
        <div class="card-body">
          <h3>会员管理</h3>
          <p>管理小程序会员信息与权限</p>
        </div>
      </div>

      <div class="info-card">
        <div class="card-icon card-icon-orange">
          <el-icon size="28"><Setting /></el-icon>
        </div>
        <div class="card-body">
          <h3>系统管理</h3>
          <p>用户、角色、菜单、组织架构配置</p>
        </div>
      </div>

      <div class="info-card">
        <div class="card-icon card-icon-purple">
          <el-icon size="28"><DataLine /></el-icon>
        </div>
        <div class="card-body">
          <h3>数据字典</h3>
          <p>代码类型与数据字典维护</p>
        </div>
      </div>
    </div>

    <!-- 底部提示 -->
    <div class="tips-card">
      <el-icon><InfoFilled /></el-icon>
      <span>提示：通过左侧菜单可以快速导航到各个管理模块</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  Location,
  User,
  Setting,
  DataLine,
  InfoFilled,
} from "@element-plus/icons-vue";

const today = computed(() => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
});
</script>

<style scoped>
.home-page {
  max-width: 960px;
  margin: 0 auto;
}

/* ========== 欢迎卡片 ========== */
.welcome-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #1a73e8 0%, #4a90d9 100%);
  border-radius: 16px;
  padding: 28px 36px;
  color: #fff;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(26, 115, 232, 0.25);
}

.welcome-title {
  margin: 0 0 6px 0;
  font-size: 26px;
  font-weight: 600;
}

.welcome-subtitle {
  margin: 0;
  font-size: 14px;
  opacity: 0.85;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 1px;
}

.stat-label {
  display: block;
  font-size: 12px;
  opacity: 0.75;
  margin-top: 2px;
}

/* ========== 卡片网格 ========== */
.card-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #fff;
  border-radius: 12px;
  padding: 20px 24px;
  cursor: pointer;
  transition: all 0.25s;
  border: 1px solid #eee;
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  border-color: #d0d7ff;
}

.card-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-icon-blue {
  background: #e8f0fe;
  color: #1a73e8;
}

.card-icon-green {
  background: #e6f7e9;
  color: #34a853;
}

.card-icon-orange {
  background: #fff3e0;
  color: #fb8c00;
}

.card-icon-purple {
  background: #f3e5f5;
  color: #8e24aa;
}

.card-body h3 {
  margin: 0 0 4px 0;
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.card-body p {
  margin: 0;
  font-size: 13px;
  color: #888;
}

/* ========== 提示卡片 ========== */
.tips-card {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 10px;
  padding: 14px 20px;
  font-size: 13px;
  color: #8c6d00;
}

.tips-card .el-icon {
  color: #faad14;
  font-size: 16px;
}
</style>
