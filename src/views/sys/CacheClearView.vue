<template>
  <div class="cache-clear-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>
        <el-icon><Brush /></el-icon>
        缓存管理
      </h2>
      <p class="subtitle">管理浏览器缓存数据，清除后可能需要重新登录</p>
    </div>

    <!-- 缓存概览卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6" v-for="stat in cacheStats" :key="stat.label">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" :style="{ color: stat.color }">
              <el-icon :size="32"><component :is="stat.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 操作区域 -->
    <el-card class="operation-card">
      <template #header>
        <div class="card-header">
          <span
            ><el-icon><Setting /></el-icon> 缓存清理</span
          >
          <el-button type="primary" size="small" @click="refreshStats">
            <el-icon><Refresh /></el-icon> 刷新统计
          </el-button>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="16">
          <el-table :data="cacheTypes" style="width: 100%" border>
            <el-table-column prop="name" label="缓存类型" width="150" />
            <el-table-column prop="description" label="说明" />
            <el-table-column prop="size" label="大小" width="120">
              <template #default="{ row }">
                <span :class="{ 'text-danger': row.size > 1024 }">
                  {{ formatSize(row.size) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" align="center">
              <template #default="{ row }">
                <el-button
                  type="danger"
                  size="small"
                  link
                  @click="clearSingleCache(row)"
                >
                  清除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>

        <el-col :span="8">
          <div class="quick-actions">
            <div class="action-group">
              <el-button
                type="danger"
                size="large"
                style="width: 100%"
                :loading="clearing"
                @click="clearAllCache"
              >
                <el-icon><Delete /></el-icon>
                清除所有缓存
              </el-button>
              <p class="tip">
                ⚠️ 清除所有缓存将清除本地存储、Cookie、IndexedDB 等全部数据
              </p>
            </div>

            <div class="action-group">
              <el-button
                type="warning"
                size="large"
                style="width: 100%"
                :loading="clearing"
                @click="clearAppCache"
              >
                <el-icon><RefreshRight /></el-icon>
                清除应用缓存（保留登录状态）
              </el-button>
              <p class="tip">清除静态资源缓存，保留用户登录信息和偏好设置</p>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
    <!-- 数据库缓存 -->
    <div class="page-header" style="margin-top: 30px">
      <h2>
        <el-icon><Coin /></el-icon>
        数据库缓存（Redis）
      </h2>
      <p class="subtitle">
        管理后端 Redis 缓存数据，清除后需要重新从数据库加载
      </p>
    </div>

    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6" v-for="item in redisCacheItems" :key="item.key">
        <el-card shadow="hover" class="stat-card redis-cache-card">
          <div class="stat-content">
            <div class="stat-icon" :style="{ color: item.color }">
              <el-icon :size="32"><component :is="item.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ item.label }}</div>
              <div class="stat-label">
                <el-tag
                  :type="
                    item.status === 'success'
                      ? 'success'
                      : item.status === 'loading'
                      ? 'warning'
                      : 'info'
                  "
                  size="small"
                >
                  {{
                    item.status === "success"
                      ? "已清除"
                      : item.status === "loading"
                      ? "清除中..."
                      : "点击清除"
                  }}
                </el-tag>
              </div>
            </div>
          </div>
          <div class="redis-card-footer">
            <el-button
              :type="item.type"
              size="small"
              :loading="item.loading"
              @click="clearRedisCache(item)"
              style="width: 100%"
            >
              <el-icon><RefreshRight /></el-icon>
              {{ item.loading ? "清除中..." : "立即清除" }}
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 清除日志 -->
    <el-card class="log-card" v-if="logs.length > 0">
      <template #header>
        <span
          ><el-icon><Document /></el-icon> 操作日志</span
        >
      </template>
      <div class="log-container">
        <div
          v-for="(log, index) in logs"
          :key="index"
          class="log-item"
          :class="log.type"
        >
          <span class="log-time">{{ log.time }}</span>
          <span class="log-icon">
            <el-icon v-if="log.type === 'success'"><CircleCheck /></el-icon>
            <el-icon v-else-if="log.type === 'error'"><CircleClose /></el-icon>
            <el-icon v-else><InfoFilled /></el-icon>
          </span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
      <div style="margin-top: 10px; text-align: right">
        <el-button size="small" link @click="clearLogs">清空日志</el-button>
      </div>
    </el-card>

    <!-- 确认对话框 -->
    <el-dialog
      v-model="confirmDialog.visible"
      :title="confirmDialog.title"
      width="400px"
      :close-on-click-modal="false"
    >
      <div class="confirm-content">
        <el-icon :size="48" color="#E6A23C"><WarningFilled /></el-icon>
        <p>{{ confirmDialog.message }}</p>
      </div>
      <template #footer>
        <el-button @click="confirmDialog.visible = false">取消</el-button>
        <el-button type="danger" @click="handleConfirm">确定清除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Brush,
  Setting,
  Refresh,
  Delete,
  RefreshRight,
  Document,
  CircleCheck,
  CircleClose,
  InfoFilled,
  WarningFilled,
  DataAnalysis,
  Files,
  Coin,
  Tickets,
  Folder,
  Menu as MenuIcon,
  User as UserIcon,
  OfficeBuilding,
  Collection,
} from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import request from "@/utils/request";

// ============ 类型定义 ============
interface CacheType {
  key: string;
  name: string;
  description: string;
  size: number;
  count: number;
  clear: () => Promise<{ success: boolean; message: string; count?: number }>;
}

interface CacheStat {
  label: string;
  value: string | number;
  icon: any;
  color: string;
}

interface LogEntry {
  time: string;
  type: "success" | "error" | "info";
  message: string;
}

// ============ Redis 缓存项类型 ============
interface RedisCacheItem {
  key: string;
  label: string;
  icon: any;
  color: string;
  type: "primary" | "success" | "warning" | "danger" | "info";
  api: string;
  loading: boolean;
  status: "idle" | "loading" | "success" | "error";
  data: unknown;
}

// ============ Redis 缓存配置 ============
const redisCacheItems = ref<RedisCacheItem[]>([
  {
    key: "code",
    label: "自定义档案缓存",
    icon: Tickets,
    color: "#409EFF",
    type: "primary",
    api: "/redis/clearCache",
    loading: false,
    status: "idle",
    data: { clearCacheType: "doc" },
  },
  {
    key: "dict",
    label: "码表缓存",
    icon: Collection,
    color: "#67C23A",
    type: "success",
    api: "/redis/clearCache",
    loading: false,
    status: "idle",
    data: { clearCacheType: "dm" },
  },
  {
    key: "menu",
    label: "菜单缓存",
    icon: MenuIcon,
    color: "#E6A23C",
    type: "warning",
    api: "/redis/clearCache",
    loading: false,
    status: "idle",
    data: { clearCacheType: "menu" },
  },
  {
    key: "org",
    label: "机构缓存",
    icon: OfficeBuilding,
    color: "#F56C6C",
    type: "danger",
    api: "/redis/clearCache",
    loading: false,
    status: "idle",
    data: { clearCacheType: "org" },
  },
]);

// ============ 清除 Redis 缓存 ============
async function clearRedisCache(item: RedisCacheItem) {
  if (item.loading) return;

  // 确认对话框
  const confirmMessage = `确定要清除「${item.label}」吗？清除后需要重新从数据库加载。`;

  try {
    await ElMessageBox.confirm(confirmMessage, "确认清除", {
      confirmButtonText: "确定清除",
      cancelButtonText: "取消",
      type: "warning",
    });
  } catch {
    return; // 用户取消
  }

  item.loading = true;
  item.status = "loading";

  try {
    const res = await request.post(item.api, item.data);
    if (res.code === 201) {
      item.status = "success";
      addLog("success", `${item.label} 清除成功`);
      ElMessage.success(`${item.label} 已清除`);
      // 3秒后重置状态
      setTimeout(() => {
        item.status = "idle";
      }, 3000);
    } else {
      item.status = "error";
      addLog("error", `${item.label} 清除失败: ${res.message}`);
      ElMessage.error(res.message || "清除失败");
      setTimeout(() => {
        item.status = "idle";
      }, 3000);
    }
  } catch {
    item.status = "error";
    addLog("error", `${item.label} 清除失败: 网络错误`);
    ElMessage.error("清除失败");
    setTimeout(() => {
      item.status = "idle";
    }, 3000);
  } finally {
    item.loading = false;
  }
}

// ============ 响应式数据 ============
const router = useRouter();
const clearing = ref(false);
const logs = ref<LogEntry[]>([]);

// 确认对话框
const confirmDialog = reactive({
  visible: false,
  title: "",
  message: "",
  onConfirm: "有吗",
});

// ============ 缓存大小统计 ============
const cacheStats = ref<CacheStat[]>([
  {
    label: "LocalStorage",
    value: "0 KB",
    icon: DataAnalysis,
    color: "#409EFF",
  },
  { label: "SessionStorage", value: "0 KB", icon: Files, color: "#67C23A" },
  { label: "Cookies", value: "0 条", icon: Coin, color: "#E6A23C" },
  { label: "IndexedDB", value: "0 个", icon: Folder, color: "#F56C6C" },
]);

// ============ 缓存类型列表 ============
const cacheTypes = ref<CacheType[]>([
  {
    key: "localStorage",
    name: "LocalStorage",
    description: "持久化存储，页面关闭后数据仍在",
    size: 0,
    count: 0,
    clear: clearLocalStorage,
  },
  {
    key: "sessionStorage",
    name: "SessionStorage",
    description: "会话存储，页面关闭后数据清除",
    size: 0,
    count: 0,
    clear: clearSessionStorage,
  },
  {
    key: "cookie",
    name: "Cookie",
    description: "服务端通信使用的 Cookie 数据",
    size: 0,
    count: 0,
    clear: clearCookies,
  },
  {
    key: "indexedDB",
    name: "IndexedDB",
    description: "大型结构化数据存储",
    size: 0,
    count: 0,
    clear: clearIndexedDB,
  },
  {
    key: "cacheAPI",
    name: "Cache API",
    description: "Service Worker 缓存资源",
    size: 0,
    count: 0,
    clear: clearCacheAPI,
  },
]);

// ============ 清除方法 ============
async function clearLocalStorage(): Promise<{
  success: boolean;
  message: string;
  count?: number;
}> {
  try {
    const count = localStorage.length;
    localStorage.clear();
    return {
      success: true,
      message: `已清除 ${count} 条 LocalStorage 数据`,
      count,
    };
  } catch (error) {
    return { success: false, message: `清除 LocalStorage 失败: ${error}` };
  }
}

async function clearSessionStorage(): Promise<{
  success: boolean;
  message: string;
  count?: number;
}> {
  try {
    const count = sessionStorage.length;
    sessionStorage.clear();
    return {
      success: true,
      message: `已清除 ${count} 条 SessionStorage 数据`,
      count,
    };
  } catch (error) {
    return { success: false, message: `清除 SessionStorage 失败: ${error}` };
  }
}

async function clearCookies(): Promise<{
  success: boolean;
  message: string;
  count?: number;
}> {
  try {
    const cookies = document.cookie.split(";");
    const count = cookies.filter((c) => c.trim()).length;
    cookies.forEach((cookie) => {
      const eqPos = cookie.indexOf("=");
      const name =
        eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
      if (name) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
      }
    });
    return { success: true, message: `已清除 ${count} 条 Cookie`, count };
  } catch (error) {
    return { success: false, message: `清除 Cookie 失败: ${error}` };
  }
}

async function clearIndexedDB(): Promise<{
  success: boolean;
  message: string;
  count?: number;
}> {
  try {
    const databases = (await indexedDB.databases?.()) || [];
    const count = databases.length;
    for (const db of databases) {
      if (db.name) {
        indexedDB.deleteDatabase(db.name);
      }
    }
    return {
      success: true,
      message: `已清除 ${count} 个 IndexedDB 数据库`,
      count,
    };
  } catch {
    try {
      const knownDBs = ["pickle", "localforage", "idb"];
      let cleared = 0;
      for (const name of knownDBs) {
        try {
          indexedDB.deleteDatabase(name);
          cleared++;
        } catch {
          // ignore
        }
      }
      return {
        success: true,
        message: `已尝试清除 ${cleared} 个已知 IndexedDB`,
        count: cleared,
      };
    } catch {
      return { success: false, message: "IndexedDB 清除失败，请手动清理" };
    }
  }
}

async function clearCacheAPI(): Promise<{
  success: boolean;
  message: string;
  count?: number;
}> {
  try {
    if ("caches" in window) {
      const keys = await caches.keys();
      const count = keys.length;
      for (const key of keys) {
        await caches.delete(key);
      }
      return { success: true, message: `已清除 ${count} 个 Cache 缓存`, count };
    }
    return { success: false, message: "当前浏览器不支持 Cache API" };
  } catch (error) {
    return { success: false, message: `清除 Cache API 失败: ${error}` };
  }
}

// ============ 获取缓存大小 ============
function getStorageSize(storage: Storage): number {
  let total = 0;
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key) {
      const value = storage.getItem(key);
      total += (key.length + (value?.length || 0)) * 2;
    }
  }
  return total;
}

function getCookieSize(): number {
  return document.cookie.length * 2;
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ============ 刷新统计 ============
async function refreshStats() {
  const lsSize = getStorageSize(localStorage);
  cacheTypes.value[0].size = lsSize;
  cacheTypes.value[0].count = localStorage.length;
  cacheStats.value[0].value = formatSize(lsSize);

  const ssSize = getStorageSize(sessionStorage);
  cacheTypes.value[1].size = ssSize;
  cacheTypes.value[1].count = sessionStorage.length;
  cacheStats.value[1].value = formatSize(ssSize);

  const cookieSize = getCookieSize();
  const cookieCount = document.cookie.split(";").filter((c) => c.trim()).length;
  cacheTypes.value[2].size = cookieSize;
  cacheTypes.value[2].count = cookieCount;
  cacheStats.value[2].value = `${cookieCount} 条`;

  try {
    const dbs = (await indexedDB.databases?.()) || [];
    cacheTypes.value[3].count = dbs.length;
    cacheStats.value[3].value = `${dbs.length} 个`;
  } catch {
    cacheStats.value[3].value = "未知";
  }

  try {
    if ("caches" in window) {
      const keys = await caches.keys();
      cacheTypes.value[4].count = keys.length;
    }
  } catch {
    // ignore
  }

  addLog("info", "缓存统计已刷新");
}

// ============ 确认对话框 ============
function showConfirm(title: string, message: string, onConfirm: () => void) {
  confirmDialog.title = title;
  confirmDialog.message = message;
  confirmDialog.onConfirm = onConfirm;
  confirmDialog.visible = true;
}

function handleConfirm() {
  if (confirmDialog.onConfirm) {
    confirmDialog.onConfirm();
  }
  confirmDialog.visible = false;
}

// ============ 清除单个缓存 ============
async function clearSingleCache(cache: CacheType) {
  showConfirm(
    `清除 ${cache.name}`,
    `确定要清除 ${cache.name} 中的所有数据吗？共 ${
      cache.count
    } 条记录，${formatSize(cache.size)}。`,
    async () => {
      const result = await cache.clear();
      if (result.success) {
        cache.size = 0;
        cache.count = 0;
        addLog("success", result.message);
        refreshStats();
        ElMessage.success(result.message);
      } else {
        addLog("error", result.message);
        ElMessage.error(result.message);
      }
    }
  );
}

// ============ 清除所有缓存 ============
async function clearAllCache() {
  showConfirm(
    "清除所有缓存",
    "确定要清除所有缓存数据吗？这将清除 LocalStorage、SessionStorage、Cookie、IndexedDB 等全部数据，你可能需要重新登录。",
    async () => {
      clearing.value = true;
      let successCount = 0;
      let failCount = 0;

      for (const cache of cacheTypes.value) {
        const result = await cache.clear();
        if (result.success) {
          cache.size = 0;
          cache.count = 0;
          successCount++;
          addLog("success", result.message);
        } else {
          failCount++;
          addLog("error", result.message);
        }
      }

      clearing.value = false;
      refreshStats();
      ElMessage.success(
        `清除完成：成功 ${successCount} 项${
          failCount > 0 ? `，失败 ${failCount} 项` : ""
        }`
      );

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    }
  );
}

// ============ 清除应用缓存 ============
async function clearAppCache() {
  showConfirm(
    "清除应用缓存",
    "将清除静态资源缓存和 IndexedDB 数据，保留登录信息和用户偏好设置。确定继续吗？",
    async () => {
      clearing.value = true;

      try {
        if ("caches" in window) {
          const keys = await caches.keys();
          for (const key of keys) {
            await caches.delete(key);
          }
          addLog("success", `已清除 ${keys.length} 个 Cache 缓存`);
        }
      } catch (error) {
        addLog("error", `清除 Cache API 失败: ${error}`);
      }

      try {
        const dbs = (await indexedDB.databases?.()) || [];
        for (const db of dbs) {
          if (db.name) {
            indexedDB.deleteDatabase(db.name);
          }
        }
        addLog("success", `已清除 ${dbs.length} 个 IndexedDB 数据库`);
      } catch {
        // ignore
      }

      clearing.value = false;
      refreshStats();
      ElMessage.success("应用缓存已清除，请刷新页面");
      setTimeout(() => {
        location.reload();
      }, 1000);
    }
  );
}

// ============ 日志管理 ============
function addLog(type: LogEntry["type"], message: string) {
  const now = new Date();
  const time = now.toLocaleTimeString();
  logs.value.unshift({ time, type, message });
  if (logs.value.length > 100) {
    logs.value = logs.value.slice(0, 100);
  }
}

function clearLogs() {
  logs.value = [];
}

// ============ 生命周期 ============
onMounted(() => {
  refreshStats();
});

onUnmounted(() => {
  // 清理
});
</script>

<style scoped>
.cache-clear-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 22px;
  color: #303133;
  margin: 0 0 6px 0;
}

.page-header .subtitle {
  color: #909399;
  font-size: 14px;
  margin: 0;
}

.stat-cards {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 12px;
}

.stat-card .stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-card .stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background-color: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-card .stat-info {
  flex: 1;
}

.stat-card .stat-value {
  font-size: 22px;
  font-weight: 600;
  color: #303133;
}

.stat-card .stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 2px;
}

.operation-card {
  border-radius: 12px;
}

.operation-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.quick-actions .action-group {
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.quick-actions .tip {
  font-size: 12px;
  color: #909399;
  margin: 8px 0 0 0;
  line-height: 1.5;
}

.log-card {
  border-radius: 12px;
  margin-top: 20px;
}

.log-container {
  max-height: 200px;
  overflow-y: auto;
  font-size: 13px;
}

.log-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid #f0f2f5;
}

.log-item:last-child {
  border-bottom: none;
}

.log-item .log-time {
  color: #909399;
  font-size: 12px;
  min-width: 80px;
}

.log-item .log-icon {
  flex-shrink: 0;
}

.log-item.success .log-icon {
  color: #67c23a;
}

.log-item.error .log-icon {
  color: #f56c6c;
}

.log-item.info .log-icon {
  color: #409eff;
}

.log-item .log-message {
  flex: 1;
  word-break: break-all;
}

.confirm-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
  text-align: center;
}

.confirm-content p {
  font-size: 15px;
  color: #606266;
  margin: 16px 0 0 0;
  line-height: 1.8;
}

.text-danger {
  color: #f56c6c !important;
}
</style>
