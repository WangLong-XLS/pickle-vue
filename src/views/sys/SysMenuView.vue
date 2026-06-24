<template>
  <div style="display: flex; height: 100%; gap: 8px; overflow: hidden">
    <!-- 左侧树形区 -->
    <div class="tree-panel">
      <!-- 树形搜索栏 -->
      <div class="tree-search">
        <el-input
          v-model="treeSearchKey"
          placeholder="搜索菜单"
          clearable
          size="small"
        />
        <el-button type="primary" size="small" @click="filterTree"
          >搜索</el-button
        >
      </div>
      <el-tree
        ref="treeRef"
        :data="filteredTreeData"
        node-key="menuUuid"
        :props="{ label: 'menuName', children: 'sysMenuIn' }"
        highlight-current
        default-expand-all
        @node-click="handleTreeNodeClick"
      >
        <template #default="{ node }">
          <span class="tree-node-text">{{ node.label }}</span>
        </template>
      </el-tree>
    </div>

    <!-- 右侧内容区 -->
    <div
      style="flex: 1; display: flex; flex-direction: column; overflow: hidden"
    >
      <!-- 顶部按钮区 -->
      <div class="tb-div">
        <div class="button-group">
          <button @click="queryData()">
            <el-icon><Search /></el-icon>
            <p>查询</p>
          </button>
          <button @click="save()">
            <el-icon><CirclePlus /></el-icon>
            <p>新增</p>
          </button>
          <button @click="update()">
            <el-icon><Edit /></el-icon>
            <p>修改</p>
          </button>
          <button @click="deleteData()">
            <el-icon><Delete /></el-icon>
            <p>删除</p>
          </button>
          <button @click="excelData()" :disabled="exportLoading">
            <el-icon><Download /></el-icon>
            <p>{{ exportLoading ? "导出中..." : "导出" }}</p>
          </button>

          <el-upload
            class="import-upload"
            :action="uploadUrl"
            :headers="{ token }"
            accept=".xlsx, .xls"
            :on-success="importData"
            :on-error="handleImportError"
            :show-file-list="false"
          >
            <button>
              <el-icon><UploadFilled /></el-icon>
              <p>导入</p>
            </button>
          </el-upload>
        </div>
      </div>

      <!-- 表格 -->
      <div class="lb-div" style="flex: 1; overflow: auto">
        <el-table
          :data="tableData"
          row-key="menuUuid"
          :header-cell-style="headerCellStyle"
          :cell-style="cellStyle"
          border
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="40" />
          <el-table-column prop="menuName" label="菜单名称" />
          <el-table-column prop="menuPath" label="后端路由路径" />
          <el-table-column prop="component" label="前端路由路径" />
          <el-table-column prop="menuIcon" label="图标" />
          <el-table-column prop="menuOrder" label="排序" />
          <el-table-column prop="menuTypeName" label="类型" />
          <el-table-column prop="visibleName" label="显示" />
        </el-table>
      </div>

      <!-- 分页 -->
      <div style="margin-top: 10px">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryParams.pageNum"
          :page-sizes="[20, 50, 100, 200]"
          :page-size="queryParams.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        />
      </div>
    </div>

    <!-- 新增/修改对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="55%"
      class="user-dialog"
      :close-on-click-modal="false"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <div class="form-row">
          <div class="form-col">
            <el-form-item label="菜单名称" label-width="30%" prop="menuName">
              <el-input v-model="form.menuName" style="width: 70%" />
            </el-form-item>
            <el-form-item
              label="后端路由路径"
              label-width="30%"
              prop="menuPath"
            >
              <el-input v-model="form.menuPath" style="width: 70%" />
            </el-form-item>
            <el-form-item label="图标" label-width="30%" prop="menuIcon">
              <el-input
                v-model="form.menuIcon"
                style="width: 70%"
                placeholder="请输入图标名称"
              />
            </el-form-item>
            <el-form-item label="父级菜单" label-width="30%" prop="parentUuid">
              <el-tree-select
                v-model="form.parentUuid"
                :data="tableTreeData"
                :props="{
                  label: 'menuName',
                  value: 'menuUuid',
                  children: 'sysMenuIn',
                }"
                clearable
                check-strictly
                placeholder="请选择父级菜单（清空为顶级）"
                style="width: 70%"
              />
            </el-form-item>
          </div>

          <div class="form-col">
            <el-form-item label="菜单类型" label-width="30%" prop="menuType">
              <el-select
                v-model="form.menuType"
                clearable
                filterable
                placeholder="请选择菜单类型"
                style="width: 70%"
              >
                <el-option
                  v-for="item in menuTypeMap"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item
              label="前端路由路径"
              label-width="30%"
              prop="component"
            >
              <el-input v-model="form.component" style="width: 70%" />
            </el-form-item>
            <el-form-item label="排序" label-width="30%" prop="menuOrder">
              <el-input
                v-model="form.menuOrder"
                type="number"
                style="width: 70%"
              ></el-input>
            </el-form-item>
            <el-form-item label="角色权限" label-width="30%" prop="roleUuidIn">
              <el-select
                v-model="form.roleUuidIn"
                clearable
                multiple
                filterable
                collapse-tags
                placeholder="请选择角色权限"
                style="width: 70%"
              >
                <el-option
                  v-for="item in roleMap"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="是否显示" label-width="30%" prop="visible">
              <el-switch
                v-model="form.visible"
                active-value="Y"
                inactive-value="N"
              />
            </el-form-item>
          </div>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 查询对话框 -->
    <el-dialog
      title="查询"
      v-model="queryDialogVisible"
      width="30%"
      :close-on-click-modal="false"
    >
      <el-form :model="queryParams" label-width="25%">
        <el-form-item label="菜单名称">
          <el-input v-model="queryParams.menuName" style="width: 70%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="queryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="querySubmit">查询</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox, FormInstance } from "element-plus";
import {
  Search,
  CirclePlus,
  Edit,
  Delete,
  Download,
  UploadFilled,
} from "@element-plus/icons-vue";
import request from "@/utils/request";

// ---------- 常量 ----------
const uploadUrl = `${process.env.VUE_APP_API_BASE_URL}/sysMenu/importExcel`;

// ---------- 表格样式 ----------
const headerCellStyle = {
  "text-align": "center",
  "background-color": "#E3ECFF",
  color: "#333333",
  height: "35px",
  padding: "0px",
};
const cellStyle = {
  "text-align": "center",
  color: "#333333",
  height: "35px",
  padding: "0px",
};

/** 菜单项类型（对应后端 SysMenu 实体） */
export interface SysMenu {
  menuUuid?: string;
  menuName: string;
  menuPath?: string;
  menuIcon?: string;
  parentUuid?: string;
  menuOrder?: string;
  menuType: string; // 0=菜单项，1=子菜单分组
  visible?: string; // Y/N
  component?: string;
  roleUuidIn?: string | string[];
  sysMenuIn?: SysMenu[];
}

// ---------- 响应式数据 ----------
const tableData = ref<SysMenu[]>([]);
const tableTreeData = ref<SysMenu[]>([]);
const treeSearchKey = ref("");
const filteredTreeData = computed(() => {
  if (!treeSearchKey.value.trim()) return tableTreeData.value;
  const key = treeSearchKey.value.toLowerCase().trim();
  return filterNodes(tableTreeData.value, key);
});
const total = ref(0);
const selectedIds = ref<string[]>([]);
const exportLoading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref("新增菜单");
const isEdit = ref(false);
const queryDialogVisible = ref(false);
const formRef = ref<FormInstance | null>(null);
const treeRef = ref<any>(null);
const currentTreeNode = ref<SysMenu | null>(null);

// 从 localStorage 获取 token
const token = ref("");
try {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    const user = JSON.parse(userStr);
    token.value = user?.token || "";
  }
} catch {
  console.error("解析用户信息失败");
}

// ---------- 查询参数 ----------
const queryParams = reactive({
  menuUuid: "",
  menuName: "",
  //加一个默认参数放置分页把所有菜单输出查出来
  parentUuid: "test",
  pageNum: 1,
  pageSize: 20,
});

// ---------- 表单 ----------
const form = ref<SysMenu>({
  menuUuid: "",
  menuName: "",
  menuPath: "",
  menuIcon: "",
  parentUuid: "",
  menuOrder: "",
  menuType: "0",
  visible: "Y",
  roleUuidIn: [],
});

const roleMap = ref<{ label: string; value: string }[]>([]);
const menuTypeMap = ref<{ label: string; value: string }[]>([]);

// 通用数组非空校验
const arrayRequired = (message: string) => {
  return (_rule: any, value: any, callback: any) => {
    if (!value || !Array.isArray(value) || value.length === 0) {
      callback(new Error(message));
    } else {
      callback();
    }
  };
};

// 表单校验规则
const rules = {
  menuName: [{ required: true, message: "请输入菜单名称", trigger: "blur" }],
  menuType: [{ required: true, message: "请选择菜单类型", trigger: "change" }],
  visible: [{ required: true, message: "请选择菜单是否显示", trigger: "blur" }],
  roleUuidIn: [
    {
      required: true,
      validator: arrayRequired("请选择权限角色"),
      trigger: "change",
    },
  ],
};

// ---------- 方法 ----------
// 递归过滤树节点
const filterNodes = (nodes: SysMenu[], keyword: string): SysMenu[] => {
  const result: SysMenu[] = [];
  for (const node of nodes) {
    const matchName = (node.menuName || "").toLowerCase().includes(keyword);
    const filteredChildren = node.sysMenuIn?.length
      ? filterNodes(node.sysMenuIn, keyword)
      : [];
    if (matchName || filteredChildren.length > 0) {
      result.push({
        ...node,
        sysMenuIn: filteredChildren,
      });
    }
  }
  return result;
};

// 树搜索（回车或按钮触发，实际由 computed 自动响应）
const filterTree = () => {
  // computed 已自动根据 treeSearchKey 过滤，这里仅做展开处理
  if (treeRef.value) {
    // 展开所有匹配节点
    const expandAll = (nodes: any[]) => {
      nodes.forEach((n) => {
        if (n.sysMenuIn && n.sysMenuIn.length > 0) {
          treeRef.value.store.getNode(n).expand();
          expandAll(n.sysMenuIn);
        }
      });
    };
    expandAll(filteredTreeData.value);
  }
};
// 加载数据
const loadData = async () => {
  try {
    const res = await request.post("sysMenu/queryPageList", queryParams);
    if (res.code === 201) {
      tableData.value = res.data.list || [];
      total.value = res.data.total || 0;
    } else {
      ElMessage.error(res.message);
    }
  } catch {
    ElMessage.error("加载数据失败");
  }
};

const loadTreeList = async () => {
  try {
    const res = await request.post("sysMenu/queryTreeList", queryParams);
    if (res.code === 201) {
      tableTreeData.value = res.data || [];
      total.value = res.data.total || 0;
    } else {
      ElMessage.error(res.message);
    }
  } catch {
    ElMessage.error("加载数据失败");
  }
};

const loadRoleList = async () => {
  try {
    const res = await request.post("sysRole/selectListByBean", {});
    if (res.code === 201) {
      roleMap.value = (res.data || []).map((item: any) => ({
        label: item.roleName,
        value: item.roleUuid,
      }));
    }
  } catch {
    console.error("加载角色列表失败");
  }
};

const queryCodeMapList = async () => {
  try {
    const data = {
      codeTypeIn: ["SYS_CD_LX"],
    };
    const res = await request.post("ggCodeTab/queryCodeMapList", data);
    if (res.code === 201) {
      const rawData = res.data?.SYS_CD_LX || {};

      // ✅ 对象转数组：{ "01": "功能菜单", "02": "分类菜单" }
      // → [{ code: "01", name: "功能菜单" }, { code: "02", name: "分类菜单" }]
      menuTypeMap.value = Object.entries(rawData).map(([code, name]) => ({
        label: name as string,
        value: code,
      }));

      console.log("转换后的数据:", menuTypeMap.value);
    }
  } catch (error) {
    // ✅ 打印完整错误信息
    console.error("加载自定义档案失败:", error);
    ElMessage.error("加载自定义档案失败，请检查网络或联系管理员");
  }
};

// 查询
const queryData = () => {
  queryParams.menuName = "";
  queryDialogVisible.value = true;
};

const querySubmit = () => {
  queryParams.pageNum = 1;
  loadData();
  queryDialogVisible.value = false;
};

// 新增
const save = () => {
  isEdit.value = false;
  dialogTitle.value = "新增菜单";
  form.value = {
    menuUuid: "",
    menuName: "",
    menuPath: "",
    menuIcon: "",
    parentUuid: "",
    menuOrder: "0",
    menuType: "0",
    visible: "Y",
  };
  dialogVisible.value = true;
};

// 修改
const update = () => {
  // 未勾选表格行时，尝试修改左侧树当前选中节点
  if (selectedIds.value.length === 0) {
    if (currentTreeNode.value) {
      isEdit.value = true;
      dialogTitle.value = "修改菜单";
      form.value = { ...currentTreeNode.value };
      dialogVisible.value = true;
      return;
    }
    ElMessage.warning("请勾选要修改的项，或在左侧选择一个菜单节点");
    return;
  }
  if (selectedIds.value.length > 1) {
    ElMessage.warning("只能选择一条数据修改");
    return;
  }
  const row = tableData.value.find(
    (item) => item.menuUuid === selectedIds.value[0]
  );
  if (!row) return;
  isEdit.value = true;
  dialogTitle.value = "修改菜单";
  form.value = { ...row };
  dialogVisible.value = true;
};

// 删除
const deleteData = async () => {
  // 如果未勾选表格行，尝试删除左侧树选中的无子级节点
  if (selectedIds.value.length === 0) {
    if (
      currentTreeNode.value &&
      (!currentTreeNode.value.sysMenuIn ||
        currentTreeNode.value.sysMenuIn.length === 0)
    ) {
      try {
        await ElMessageBox.confirm(
          `确认删除菜单"${currentTreeNode.value.menuName}"吗？`,
          "提示",
          { type: "warning" }
        );
        const res = await request.post("sysMenu/delete", {
          menuUuidIn: [currentTreeNode.value.menuUuid],
        });
        if (res.code === 201) {
          ElMessage.success("删除成功");
          currentTreeNode.value = null;
          loadTreeList();
        } else {
          ElMessage.error(res.message);
        }
      } catch (e: any) {
        if (e !== "cancel") console.error(e);
      }
      return;
    }
    ElMessage.warning("请勾选要删除的项，或选择一个无子菜单的节点");
    return;
  }
  try {
    await ElMessageBox.confirm("确认删除选中的菜单吗？", "提示", {
      type: "warning",
    });
    const res = await request.post("sysMenu/delete", {
      menuUuidIn: selectedIds.value,
    });
    if (res.code === 201) {
      ElMessage.success("删除成功");
      selectedIds.value = [];
      loadData();
    } else {
      ElMessage.error(res.message);
    }
  } catch (e: any) {
    if (e !== "cancel") console.error(e);
  }
};

// 提交表单
const submit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    const api = isEdit.value ? "sysMenu/update" : "sysMenu/save";
    const res = await request.post(api, form.value);
    if (res.code === 201) {
      ElMessage.success(isEdit.value ? "修改成功" : "新增成功");
      dialogVisible.value = false;
      loadData();
    } else {
      ElMessage.error(res.message);
    }
  } catch {
    ElMessage.error("请补充表单信息");
  }
};

// 导出
const excelData = async () => {
  if (exportLoading.value) return;
  exportLoading.value = true;
  try {
    await request.post(
      "sysMenu/exportExcel",
      {
        menuName: queryParams.menuName,
        menuUuidIn: selectedIds.value,
        pageNum: queryParams.pageNum,
        pageSize: queryParams.pageSize,
      },
      {
        responseType: "blob",
        fileName: `菜单数据_${new Date()
          .toISOString()
          .slice(0, 19)
          .replace(/:/g, "-")}.xlsx`,
      }
    );
    ElMessage.success("导出成功");
  } catch {
    ElMessage.error("导出失败");
  } finally {
    exportLoading.value = false;
  }
};

// 导入成功
const importData = (res: any) => {
  if (res.code === 201) {
    ElMessage.success(res.message || "导入成功");
    loadData();
  } else {
    ElMessage.error(res.message || "导入失败");
  }
};

// 导入失败
const handleImportError = (error: any) => {
  console.error("导入失败", error);
  ElMessage.error("导入失败，请检查文件格式");
};

// 树节点点击 — 右侧展示该节点的直接子菜单
const handleTreeNodeClick = (node: SysMenu) => {
  currentTreeNode.value = node;
  queryParams.parentUuid = node.menuUuid;
  loadData();
};

// 表格选中
const handleSelectionChange = (val: SysMenu[]) => {
  selectedIds.value = val.map((item) => item.menuUuid || "").filter(Boolean);
};

// 分页
const handleSizeChange = (size: number) => {
  queryParams.pageSize = size;
  loadData();
};

const handleCurrentChange = (page: number) => {
  queryParams.pageNum = page;
  loadData();
};

// ---------- 生命周期 ----------
onMounted(() => {
  loadTreeList();
  loadRoleList();
  queryCodeMapList();
});
</script>

<style scoped>
@import "@/utils/styles/button-group.scss";

.tree-panel {
  width: 200px;
  min-width: 200px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 8px 4px;
  overflow-y: auto;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.tree-search {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
  align-items: center;
}
.tree-search .el-input {
  flex: 1;
}

.tree-node-text {
  color: #333;
  font-weight: bold;
  font-size: 13px;
}
</style>

<style>
.user-dialog .dialog-form-wrapper {
  padding: 10px 0 0 0;
  width: 100%;
}
.user-dialog .form-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}
.user-dialog .form-col {
  flex: 1;
  min-width: 280px;
  box-sizing: border-box;
}
</style>
