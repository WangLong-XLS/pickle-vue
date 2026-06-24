<template>
  <div>
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

        <!-- 导入按钮 -->
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

    <div class="lb-div">
      <el-table
        :data="tableData"
        :header-cell-style="headerCellStyle"
        :cell-style="cellStyle"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" />
        <el-table-column prop="roleCode" label="角色编码" />
        <el-table-column prop="roleName" label="角色名称" />
        <el-table-column prop="roleDesc" label="角色描述" />
        <el-table-column prop="pubFlgName" label="公用标志Y/N" />
        <el-table-column prop="orgUuid" label="行政机构" />
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

    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="55%"
      class="user-dialog"
      :close-on-click-modal="false"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <div class="dialog-form-wrapper">
          <div class="form-row">
            <!-- 左列 -->
            <div class="form-col">
              <el-form-item
                label="角色编码："
                label-width="40%"
                prop="roleCode"
              >
                <el-input
                  v-model="form.roleCode"
                  autocomplete="off"
                  style="width: 70%"
                ></el-input>
              </el-form-item>
              <el-form-item label="角色描述：" label-width="40%">
                <el-input
                  v-model="form.roleDesc"
                  autocomplete="off"
                  style="width: 70%"
                ></el-input>
              </el-form-item>
              <el-form-item label="行政机构：" label-width="40%">
                <el-select
                  v-model="form.orgUuid"
                  placeholder=""
                  style="width: 70%"
                >
                  <el-option
                    v-for="item in orgMap"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </div>

            <!-- 右列 -->
            <div class="form-col">
              <el-form-item
                label="角色名称："
                label-width="40%"
                prop="roleName"
              >
                <el-input
                  v-model="form.roleName"
                  autocomplete="off"
                  style="width: 70%"
                ></el-input>
              </el-form-item>
              <el-form-item label="公用标志Y/N：" label-width="40%">
                <el-select
                  v-model="form.pubFlg"
                  placeholder=""
                  style="width: 70%"
                >
                  <el-option label="是" value="Y" />
                  <el-option label="否" value="N" />
                </el-select>
              </el-form-item>
            </div>
          </div>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submit()">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <div>
      <el-dialog
        title="查询"
        v-model="queryDialogVisible"
        width="30%"
        :close-on-click-modal="false"
      >
        <el-form :model="queryParams">
          <el-form-item label="角色名称：" label-width="25%">
            <el-input
              v-model="queryParams.roleName"
              autocomplete="off"
              style="width: 50%"
            ></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="queryDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="querySubmit()">查询</el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<style scoped>
@import "@/utils/styles/button-group.scss";
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

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
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
import { SysUser } from "@/views/sys/SysUserView.vue";

/** 菜单项类型（对应后端 SysRole 实体） */
export interface SysRole {
  roleUuid?: string;
  roleCode?: string;
  roleName?: string;
  roleDesc?: string;
  pubFlg?: string;
  orgUuid?: string;
}

// ---------- 常量 ----------
const uploadUrl = `${process.env.VUE_APP_API_BASE_URL}/sysAdOrg/importExcel`;

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
const tableData = ref<SysRole[]>([]);
const total = ref(0);
const selectedIds = ref<string[]>([]);
const exportLoading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref("新增");
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
  roleName: "",
  pageNum: 1,
  pageSize: 20,
});

// ---------- 表单 ----------
const form = ref<SysRole>({
  roleUuid: "",
  roleCode: "",
  roleName: "",
  roleDesc: "",
  pubFlg: "",
  orgUuid: "",
});

const orgMap = ref<{ label: string; value: string }[]>([]);

const rules = {
  roleCode: [{ required: true, message: "请输入角色编码", trigger: "blur" }],
  roleName: [{ required: true, message: "请输入角色名称", trigger: "change" }],
};

// ---------- 方法 ----------
// 加载数据
const loadData = async () => {
  try {
    const res = await request.post("sysRole/queryPageList", queryParams);
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

const transformOrgData = (data: Record<string, string>) => {
  return Object.keys(data).map((key) => ({
    value: key,
    label: data[key],
  }));
};

const selectOrgCode2OrgNameMap = async () => {
  const res = await request.post("sysAdOrg/selectOrgCode2OrgNameMap", {});
  if (res.code === 201) {
    orgMap.value = transformOrgData(res.data); // ✅ 直接调用，不用 this
  } else {
    ElMessage.error(res.message);
  }
};

// 查询
const queryData = () => {
  queryParams.roleName = "";
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
    roleUuid: "",
    roleCode: "",
    roleName: "",
    roleDesc: "",
    pubFlg: "",
    orgUuid: "",
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
    (item) => item.roleUuid === selectedIds.value[0]
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
    await ElMessageBox.confirm("确认删除选中的数据吗？", "提示", {
      type: "warning",
    });
    const res = await request.post("sysRole/delete", {
      roleUuidIn: selectedIds.value,
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
    const api = isEdit.value ? "sysRole/update" : "sysRole/save";
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
      "sysRole/exportExcel",
      {
        roleName: queryParams.roleName,
        roleUuidIn: selectedIds.value,
        pageNum: queryParams.pageNum,
        pageSize: queryParams.pageSize,
      },
      {
        responseType: "blob",
        fileName: `export_${new Date()
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
const handleSelectionChange = (val: SysUser[]) => {
  selectedIds.value = val.map((item) => item.roleUuid || "").filter(Boolean);
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
  selectOrgCode2OrgNameMap();
});
</script>
