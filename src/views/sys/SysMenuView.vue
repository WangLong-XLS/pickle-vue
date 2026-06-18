<template>
  <div>
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
    <div class="lb-div">
      <el-table
        :data="tableData"
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

    <!-- 新增/修改对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="50%"
      :close-on-click-modal="false"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <div class="form-row">
          <div class="form-col">
            <el-form-item label="菜单名称" label-width="25%" prop="menuName">
              <el-input v-model="form.menuName" style="width: 70%" />
            </el-form-item>
            <el-form-item
              label="后端路由路径"
              label-width="25%"
              prop="menuPath"
            >
              <el-input v-model="form.menuPath" style="width: 70%" />
            </el-form-item>
            <el-form-item label="图标" label-width="25%" prop="menuIcon">
              <el-input
                v-model="form.menuIcon"
                style="width: 70%"
                placeholder="请输入图标名称"
              />
            </el-form-item>
            <el-form-item label="父级菜单" label-width="25%" prop="parentUuid">
              <el-select
                v-model="form.parentUuid"
                clearable
                placeholder="请选择父级菜单"
                style="width: 70%"
              >
                <el-option label="顶级菜单" value="" />
                <el-option
                  v-for="item in parentOptions"
                  :key="item.menuUuid"
                  :label="item.menuName"
                  :value="item.menuUuid"
                />
              </el-select>
            </el-form-item>
          </div>

          <div class="form-col">
            <el-form-item label="菜单类型" label-width="25%" prop="menuType">
              <el-select v-model="form.menuType" style="width: 70%">
                <el-option label="菜单项" value="0" />
                <el-option label="子菜单分组" value="1" />
              </el-select>
            </el-form-item>
            <el-form-item
              label="前端路由路径"
              label-width="25%"
              prop="component"
            >
              <el-input v-model="form.component" style="width: 70%" />
            </el-form-item>
            <el-form-item label="排序" label-width="25%" prop="menuOrder">
              <el-input
                v-model="form.menuOrder"
                type="number"
                style="width: 70%"
              ></el-input>
            </el-form-item>
            <el-form-item label="是否显示" label-width="25%" prop="visible">
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
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Search,
  CirclePlus,
  Edit,
  Delete,
  Download,
  UploadFilled,
} from "@element-plus/icons-vue";
import request from "@/utils/request";
import type { SysMenu } from "@/types/menu";

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

// ---------- 响应式数据 ----------
const tableData = ref<SysMenu[]>([]);
const total = ref(0);
const selectedIds = ref<string[]>([]);
const exportLoading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref("新增菜单");
const isEdit = ref(false);
const queryDialogVisible = ref(false);

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
  menuName: "",
  pageNum: 1,
  pageSize: 20,
});

// 重置查询参数
const resetQueryParams = () => {
  queryParams.menuName = "";
  queryParams.pageNum = 1;
  queryParams.pageSize = 20;
};

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
});

// 父级菜单选项（用于下拉选择）
const parentOptions = ref<SysMenu[]>([]);

// 表单校验规则
const rules = {
  menuName: [{ required: true, message: "请输入菜单名称", trigger: "blur" }],
  menuPath: [
    { required: true, message: "请输入后端路由路径", trigger: "blur" },
  ],
  component: [
    { required: true, message: "请输入前端路由路径", trigger: "blur" },
  ],
  menuType: [{ required: true, message: "请选择菜单类型", trigger: "change" }],
  visible: [{ required: true, message: "请选择菜单是否显示", trigger: "blur" }],
};

// ---------- 方法 ----------
// 加载数据
const loadData = async () => {
  try {
    const res = await request.post("sysMenu/queryPageList", queryParams);
    if (res.code === 201) {
      tableData.value = res.data.list || [];
      total.value = res.data.total || 0;
      resetQueryParams();
    } else {
      ElMessage.error(res.message);
    }
  } catch {
    ElMessage.error("加载数据失败");
  }
};

// 加载父级菜单选项
const loadParentOptions = async () => {
  try {
    const res = await request.post("sysMenu/selectParentList", {});
    if (res.code === 201) {
      parentOptions.value = res.data || [];
    }
  } catch {
    console.error("加载父级菜单失败");
  }
};

// 查询
const queryData = () => {
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
  if (selectedIds.value.length === 0) {
    ElMessage.warning("请勾选要修改的项");
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
  if (selectedIds.value.length === 0) {
    ElMessage.warning("请勾选要删除的项");
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
  try {
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
    ElMessage.error("保存失败");
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
  loadData();
  loadParentOptions();
});
</script>

<style scoped>
@import "@/styles/button-group.scss";
</style>
