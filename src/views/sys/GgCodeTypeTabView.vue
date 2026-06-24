<template>
  <div>
    <!-- 顶部按钮区 -->
    <div class="tb-div">
      <div class="button-group">
        <button @click="queryData">
          <el-icon><Search /></el-icon>
          <p>查询</p>
        </button>
        <button @click="save">
          <el-icon><CirclePlus /></el-icon>
          <p>新增</p>
        </button>
        <button @click="update">
          <el-icon><Edit /></el-icon>
          <p>修改</p>
        </button>
        <button @click="deleteData">
          <el-icon><Delete /></el-icon>
          <p>删除</p>
        </button>
        <button @click="excelData" :disabled="exportLoading">
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

    <!-- 主表表格 -->
    <div class="lb-div">
      <el-table
        :data="tableData"
        :header-cell-style="headerCellStyle"
        :cell-style="cellStyle"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="40" />
        <el-table-column prop="code" label="编码">
          <template #default="{ row }">
            <el-button
              style="
                color: #0875d5;
                border: none;
                background-color: transparent;
              "
              @click="queryCodeInfoList(row)"
            >
              {{ row.code }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="isTreeMc" label="是否树" />
        <el-table-column prop="cjRyMc" label="创建人" />
        <el-table-column prop="cjSj" :formatter="formatDate" label="创建时间" />
        <el-table-column prop="xgRyMc" label="修改人" />
        <el-table-column prop="xgSj" :formatter="formatDate" label="修改时间" />
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

    <!-- 主表新增/修改对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="35%"
      class="code-type-dialog"
      :close-on-click-modal="false"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="编码" prop="code" label-width="30%">
          <el-input
            v-model="form.code"
            placeholder="请输入编码"
            style="width: 70%"
          />
        </el-form-item>
        <el-form-item label="名称" prop="name" label-width="30%">
          <el-input
            v-model="form.name"
            placeholder="请输入名称"
            style="width: 70%"
          />
        </el-form-item>
        <el-form-item label="是否树" prop="isTree" label-width="30%">
          <el-select
            v-model="form.isTree"
            placeholder="请选择是否树"
            style="width: 70%"
          >
            <el-option label="是" value="Y" />
            <el-option label="否" value="N" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 主表查询对话框 -->
    <el-dialog
      title="查询"
      v-model="queryDialogVisible"
      width="30%"
      :close-on-click-modal="false"
    >
      <el-form :model="queryParams" label-width="80px">
        <el-form-item label="编码" label-width="30%">
          <el-input
            v-model="queryParams.code"
            placeholder="请输入编码"
            style="width: 70%"
          />
        </el-form-item>
        <el-form-item label="名称" label-width="30%">
          <el-input
            v-model="queryParams.name"
            placeholder="请输入名称"
            style="width: 70%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="queryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="querySubmit">查询</el-button>
      </template>
    </el-dialog>

    <!-- 子表弹窗 -->
    <el-dialog
      :title="subDialogTitle"
      v-model="subDialogVisible"
      width="60%"
      :close-on-click-modal="false"
    >
      <!-- 子表按钮 -->
      <div class="tb-div">
        <div class="button-group">
          <button @click="saveSub">
            <el-icon><CirclePlus /></el-icon>
            <p>新增</p>
          </button>
          <button @click="updateSub">
            <el-icon><Edit /></el-icon>
            <p>修改</p>
          </button>
          <button @click="deleteSub">
            <el-icon><Delete /></el-icon>
            <p>删除</p>
          </button>
        </div>
      </div>

      <!-- 子表表格 -->
      <div class="lb-div">
        <el-table
          :data="subTableData"
          :header-cell-style="headerCellStyle"
          :cell-style="cellStyle"
          border
          @selection-change="handleSubSelectionChange"
        >
          <el-table-column type="selection" width="40" />
          <el-table-column prop="code" label="编码" />
          <el-table-column prop="name" label="名称" />
          <el-table-column prop="sortValue" label="排序值" />
          <el-table-column prop="cjRyMc" label="创建人" />
          <el-table-column
            prop="cjSj"
            :formatter="formatDate"
            label="创建时间"
          />
          <el-table-column prop="xgRyMc" label="修改人" />
          <el-table-column
            prop="xgSj"
            :formatter="formatDate"
            label="修改时间"
          />
        </el-table>
      </div>

      <!-- 子表新增/修改对话框 -->
      <el-dialog
        :title="dialogTitle"
        v-model="subFormDialogVisible"
        width="35%"
        append-to-body
        :close-on-click-modal="false"
      >
        <el-form
          :model="subForm"
          :rules="subRules"
          ref="subFormRef"
          label-width="100px"
        >
          <el-form-item label="编码" prop="code" label-width="30%">
            <el-input
              v-model="subForm.code"
              placeholder="请输入编码"
              style="width: 70%"
            />
          </el-form-item>
          <el-form-item label="名称" prop="name" label-width="30%">
            <el-input
              v-model="subForm.name"
              placeholder="请输入名称"
              style="width: 70%"
            />
          </el-form-item>
          <el-form-item label="排序值" label-width="30%">
            <el-input
              v-model="subForm.sortValue"
              type="number"
              placeholder="请输入排序值"
              style="width: 70%"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="subFormDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitSub">确定</el-button>
        </template>
      </el-dialog>
    </el-dialog>
  </div>
</template>

<style scoped>
@import "@/utils/styles/button-group.scss";
</style>

<style>
.code-type-dialog .el-form-item {
  margin-bottom: 22px;
}
</style>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
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

// ============ 类型定义 ============
interface CodeTypeTab {
  codeTypeTabUuid?: string;
  code?: string;
  name?: string;
  isTree?: string;
  isTreeMc?: string;
  cjRyMc?: string;
  cjSj?: string;
  xgRyMc?: string;
  xgSj?: string;
}

interface CodeTab {
  codeTabUuid?: string;
  code?: string;
  name?: string;
  sortValue?: number;
  codeType?: string;
  cjRyMc?: string;
  cjSj?: string;
  xgRyMc?: string;
  xgSj?: string;
}

// ============ 常量 ============
const uploadUrl = `${process.env.VUE_APP_API_BASE_URL}/ggCodeTypeTab/importExcel`;

// ============ 表格样式 ============
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

// ============ Token ============
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

// ============ 主表数据 ============
const tableData = ref<CodeTypeTab[]>([]);
const total = ref(0);
const selectedIds = ref<string[]>([]);
const exportLoading = ref(false);

// 查询参数
const queryParams = reactive({
  code: "",
  name: "",
  pageNum: 1,
  pageSize: 20,
});

// ============ 主表表单 ============
const dialogVisible = ref(false);
const dialogTitle = ref("新增");
const isEdit = ref(false);
const queryDialogVisible = ref(false);
const formRef = ref<FormInstance | null>(null);

const form = ref<CodeTypeTab>({
  code: "",
  name: "",
  isTree: "N",
});

const rules = {
  code: [{ required: true, message: "请输入编码", trigger: "blur" }],
  name: [{ required: true, message: "请输入名称", trigger: "blur" }],
  isTree: [{ required: true, message: "请选择是否树", trigger: "change" }],
};

// ============ 子表数据 ============
const subTableData = ref<CodeTab[]>([]);
const subSelectedIds = ref<string[]>([]);
const subDialogVisible = ref(false);
const subDialogTitle = ref("");
const subCurrentCodeType = ref(""); // 当前选中的编码类型

// 子表表单
const subFormDialogVisible = ref(false);
const subFormRef = ref<FormInstance | null>(null);
const subIsEdit = ref(false);

const subForm = ref<CodeTab>({
  code: "",
  name: "",
  sortValue: 0,
  codeType: "",
});

const subRules = {
  code: [{ required: true, message: "请输入编码", trigger: "blur" }],
  name: [{ required: true, message: "请输入名称", trigger: "blur" }],
};

// ============ 主表方法 ============
// 加载数据
const loadData = async () => {
  try {
    const res = await request.post("ggCodeTypeTab/queryPageList", queryParams);
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

// 查询
const queryData = () => {
  queryParams.code = "";
  queryParams.name = "";
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
  dialogTitle.value = "新增";
  form.value = {
    code: "",
    name: "",
    isTree: "N",
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
    (item) => item.codeTypeTabUuid === selectedIds.value[0]
  );
  if (!row) return;
  isEdit.value = true;
  dialogTitle.value = "修改";
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
    await ElMessageBox.confirm("确认删除选中的项吗？", "提示", {
      type: "warning",
    });
    const res = await request.post("ggCodeTypeTab/delete", {
      codeTypeTabUuidIn: selectedIds.value,
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

// 提交主表表单
const submit = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    const api = isEdit.value ? "ggCodeTypeTab/update" : "ggCodeTypeTab/save";
    const res = await request.post(api, form.value);
    if (res.code === 201) {
      ElMessage.success(isEdit.value ? "修改成功" : "新增成功");
      dialogVisible.value = false;
      loadData();
    } else {
      ElMessage.error(res.message);
    }
  } catch {
    // 校验失败或请求失败
  }
};

// ============ 子表方法 ============
// 查询子表数据（点击编码按钮）
const queryCodeInfoList = async (row: CodeTypeTab) => {
  subDialogVisible.value = true;
  subDialogTitle.value = row.name || "";
  subCurrentCodeType.value = row.code || "";

  try {
    const res = await request.post("ggCodeTab/queryCodeInfoList", {
      codeType: row.code,
    });
    if (res.code === 201) {
      subTableData.value = res.data || [];
    } else {
      ElMessage.error(res.message);
    }
  } catch {
    ElMessage.error("加载子表数据失败");
  }
};

// 重置子表数据
const resetSubData = async () => {
  if (!subCurrentCodeType.value) return;
  try {
    const res = await request.post("ggCodeTab/queryCodeInfoList", {
      codeType: subCurrentCodeType.value,
    });
    if (res.code === 201) {
      subTableData.value = res.data || [];
    }
  } catch {
    console.error("加载子表数据失败");
  }
};

// 新增子表
const saveSub = () => {
  subIsEdit.value = false;
  subFormDialogVisible.value = true;
  subForm.value = {
    code: "",
    name: "",
    sortValue: 0,
    codeType: subCurrentCodeType.value,
  };
};

// 修改子表
const updateSub = () => {
  if (subSelectedIds.value.length === 0) {
    ElMessage.warning("请勾选要修改的项");
    return;
  }
  if (subSelectedIds.value.length > 1) {
    ElMessage.warning("只能选择一条数据修改");
    return;
  }
  const row = subTableData.value.find(
    (item) => item.codeTabUuid === subSelectedIds.value[0]
  );
  if (!row) return;
  dialogTitle.value = "修改";
  subIsEdit.value = true;
  subForm.value = { ...row };
  subFormDialogVisible.value = true;
};

// 删除子表
const deleteSub = async () => {
  if (subSelectedIds.value.length === 0) {
    ElMessage.warning("请勾选要删除的项");
    return;
  }
  try {
    await ElMessageBox.confirm("确认删除选中的项吗？", "提示", {
      type: "warning",
    });
    const res = await request.post("ggCodeTab/delete", {
      codeTabUuidIn: subSelectedIds.value,
    });
    if (res.code === 201) {
      ElMessage.success("删除成功");
      subSelectedIds.value = [];
      resetSubData();
    } else {
      ElMessage.error(res.message);
    }
  } catch (e: any) {
    if (e !== "cancel") console.error(e);
  }
};

// 提交子表表单
const submitSub = async () => {
  if (!subFormRef.value) return;
  try {
    await subFormRef.value.validate();
    // 确保 codeType 有值
    const submitData = {
      ...subForm.value,
      codeType: subCurrentCodeType.value,
    };
    const api = subIsEdit.value ? "ggCodeTab/update" : "ggCodeTab/save";
    const res = await request.post(api, submitData);
    if (res.code === 201) {
      ElMessage.success(subIsEdit.value ? "修改成功" : "新增成功");
      subFormDialogVisible.value = false;
      resetSubData();
    } else {
      ElMessage.error(res.message);
    }
  } catch {
    // 校验失败或请求失败
  }
};

// ============ 导出 ============
const excelData = async () => {
  if (exportLoading.value) return;
  exportLoading.value = true;
  try {
    await request.post(
      "ggCodeTypeTab/exportExcel",
      {
        code: queryParams.code,
        name: queryParams.name,
        codeTypeTabUuidIn: selectedIds.value,
      },
      {
        responseType: "blob",
        fileName: `字典类型数据_${new Date()
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

// ============ 导入 ============
const importData = (res: any) => {
  if (res.code === 201) {
    ElMessage.success(res.message || "导入成功");
    loadData();
  } else {
    ElMessage.error(res.message || "导入失败");
  }
};

const handleImportError = (error: any) => {
  console.error("导入失败", error);
  ElMessage.error("导入失败，请检查文件格式");
};

// ============ 表格选中 ============
const handleSelectionChange = (val: CodeTypeTab[]) => {
  selectedIds.value = val
    .map((item) => item.codeTypeTabUuid || "")
    .filter(Boolean);
};

const handleSubSelectionChange = (val: CodeTab[]) => {
  subSelectedIds.value = val
    .map((item) => item.codeTabUuid || "")
    .filter(Boolean);
};

// ============ 分页 ============
const handleSizeChange = (size: number) => {
  queryParams.pageSize = size;
  loadData();
};

const handleCurrentChange = (page: number) => {
  queryParams.pageNum = page;
  loadData();
};

// ============ 日期格式化 ============
const formatDate = (_row: any, _column: any, cellValue: string) => {
  if (!cellValue) return "";
  const date = new Date(cellValue);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// ============ 生命周期 ============
onMounted(() => {
  loadData();
});
</script>
