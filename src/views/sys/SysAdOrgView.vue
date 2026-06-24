<template>
  <div>
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

    <div class="lb-div table-wrapper">
      <el-table
        :data="tableData"
        :header-cell-style="headerCellStyle"
        :cell-style="cellStyle"
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="46" fixed="left" />
        <el-table-column
          prop="orgCode"
          label="机构代码"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="orgName"
          label="机构名称"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column
          prop="parentOrgUuid"
          label="上级机构"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="orgNameShort"
          label="机构简称"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="orgEngName"
          label="机构英文名称"
          min-width="160"
          show-overflow-tooltip
        />
        <el-table-column
          prop="areaCd"
          label="国家地区代码"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="sjMc"
          label="省级代码"
          min-width="100"
          show-overflow-tooltip
        />
        <el-table-column
          prop="shijMc"
          label="市级代码"
          min-width="100"
          show-overflow-tooltip
        />
        <el-table-column
          prop="xjMc"
          label="县级代码"
          min-width="100"
          show-overflow-tooltip
        />
        <el-table-column
          prop="orgAdress"
          label="详细地址"
          min-width="250"
          show-overflow-tooltip
        />
        <el-table-column
          prop="postCode"
          label="邮编"
          min-width="90"
          show-overflow-tooltip
        />
        <el-table-column
          prop="email"
          label="电子邮箱"
          min-width="160"
          show-overflow-tooltip
        />
        <el-table-column
          prop="contactTel"
          label="联系电话"
          min-width="130"
          show-overflow-tooltip
        />
        <el-table-column
          prop="foundTime"
          label="成立日期"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="legalPerson"
          label="法定代表人"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="isCorporateName"
          label="是否法人机构"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="isGroupName"
          label="是否集团"
          min-width="100"
          show-overflow-tooltip
        />
        <el-table-column
          prop="corpOrg"
          label="所属法人机构"
          min-width="140"
          show-overflow-tooltip
        />
        <el-table-column
          prop="orgStatus"
          label="所属集团"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="sortNo"
          label="机构排序号"
          min-width="110"
          show-overflow-tooltip
        />
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
      width="80%"
      class="user-dialog"
      :close-on-click-modal="false"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <div class="form-row">
          <!-- 左列 -->
          <div class="form-col">
            <el-form-item label="机构代码" prop="orgCode">
              <el-input v-model="form.orgCode" placeholder="请输入机构代码" />
            </el-form-item>
            <el-form-item label="机构名称" prop="orgName">
              <el-input v-model="form.orgName" placeholder="请输入机构名称" />
            </el-form-item>
            <el-form-item label="上级机构" prop="parentOrgUuid">
              <el-input
                v-model="form.parentOrgUuid"
                placeholder="请输入上级机构"
              />
            </el-form-item>
            <el-form-item label="机构简称">
              <el-input
                v-model="form.orgNameShort"
                placeholder="请输入机构简称"
              />
            </el-form-item>
            <el-form-item label="机构英文名称">
              <el-input
                v-model="form.orgEngName"
                placeholder="请输入机构英文名称"
              />
            </el-form-item>
          </div>

          <!-- 中列 -->
          <div class="form-col">
            <el-form-item label="国家地区代码">
              <el-input
                v-model="form.areaCd"
                placeholder="请输入国家地区代码"
              />
            </el-form-item>
            <el-form-item label="邮编">
              <el-input v-model="form.postCode" placeholder="请输入邮编" />
            </el-form-item>
            <el-form-item label="电子邮箱">
              <el-input v-model="form.email" placeholder="请输入电子邮箱" />
            </el-form-item>
            <el-form-item label="联系电话">
              <el-input
                v-model="form.contactTel"
                placeholder="请输入联系电话"
              />
            </el-form-item>
            <el-form-item label="成立日期">
              <el-input v-model="form.foundTime" placeholder="请输入成立日期" />
            </el-form-item>
          </div>

          <!-- 中右列 -->
          <div class="form-col">
            <el-form-item label="法定代表人">
              <el-input
                v-model="form.legalPerson"
                placeholder="请输入法定代表人"
              />
            </el-form-item>
            <el-form-item label="是否法人机构">
              <el-select
                v-model="form.isCorporate"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option label="是" value="Y" />
                <el-option label="否" value="N" />
              </el-select>
            </el-form-item>
            <el-form-item label="所在地">
              <div class="location-wrapper">
                <el-select
                  v-model="form.sjDm"
                  @change="handleProvinceChange"
                  placeholder="请选择省"
                  clearable
                >
                  <el-option
                    v-for="item in provinceList"
                    :key="item.sjXzqhDm"
                    :label="item.sjXzqhMc"
                    :value="item.sjXzqhDm"
                  />
                </el-select>
                <el-select
                  v-model="form.shijDm"
                  @change="handleCityChange"
                  placeholder="请选择市"
                  clearable
                >
                  <el-option
                    v-for="item in cityList"
                    :key="item.shijXzqhDm"
                    :label="item.shijXzqhMc"
                    :value="item.shijXzqhDm"
                  />
                </el-select>
                <el-select
                  v-model="form.xjDm"
                  placeholder="请选择区/县"
                  clearable
                >
                  <el-option
                    v-for="item in countyList"
                    :key="item.xjXzqhDm"
                    :label="item.xjXzqhMc"
                    :value="item.xjXzqhDm"
                  />
                </el-select>
              </div>
            </el-form-item>
            <el-form-item label="详细地址">
              <el-input v-model="form.orgAdress" placeholder="请输入详细地址" />
            </el-form-item>
          </div>

          <!-- 右列 -->
          <div class="form-col">
            <el-form-item label="是否集团">
              <el-select
                v-model="form.isGroup"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option label="是" value="Y" />
                <el-option label="否" value="N" />
              </el-select>
            </el-form-item>
            <el-form-item label="所属法人机构">
              <el-input
                v-model="form.corpOrg"
                placeholder="请输入所属法人机构"
              />
            </el-form-item>
            <el-form-item label="所属集团">
              <el-input v-model="form.orgStatus" placeholder="请输入所属集团" />
            </el-form-item>
            <el-form-item label="机构排序号">
              <el-input v-model="form.sortNo" placeholder="请输入机构排序号" />
            </el-form-item>
          </div>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submit">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查询对话框 -->
    <el-dialog
      title="查询"
      v-model="queryDialogVisible"
      width="30%"
      :close-on-click-modal="false"
    >
      <el-form :model="queryParams" label-width="80px">
        <el-form-item label="机构名称">
          <el-input
            v-model="queryParams.orgName"
            placeholder="请输入机构名称"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="queryDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="querySubmit">查询</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
@import "@/utils/styles/button-group.scss";

.location-wrapper {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* 表格横向滚动 */
.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

/* 滚动条样式 */
.table-wrapper::-webkit-scrollbar {
  height: 8px;
}
.table-wrapper::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 4px;
}
.table-wrapper::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 4px;
}
.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: #909399;
}
</style>

<style>
.user-dialog .form-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}
.user-dialog .form-col {
  flex: 1;
  min-width: 220px;
  box-sizing: border-box;
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
interface SysAdOrg {
  orgUuid?: string;
  parentOrgUuid?: string;
  orgCode?: string;
  roleDesc?: string;
  orgName?: string;
  orgNameShort?: string;
  orgEngName?: string;
  areaCd?: string;
  sjDm?: string;
  shijDm?: string;
  xjDm?: string;
  orgAdress?: string;
  postCode?: string;
  email?: string;
  contactTel?: string;
  foundTime?: string;
  legalPerson?: string;
  isCorporate?: string;
  isGroup?: string;
  corpOrg?: string;
  orgStatus?: string;
  sortNo?: string;
}

interface XzqhItem {
  sjXzqhDm: string;
  sjXzqhMc: string;
  shijXzqhDm?: string;
  shijXzqhMc?: string;
  xjXzqhDm?: string;
  xjXzqhMc?: string;
  dmShijXzqhList?: XzqhItem[];
  dmXjXzqhList?: XzqhItem[];
}

// ============ 常量 ============
const uploadUrl = `${process.env.VUE_APP_API_BASE_URL}/sysAdOrg/importExcel`;

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

// ============ 响应式数据 ============
const tableData = ref<SysAdOrg[]>([]);
const total = ref(0);
const selectedIds = ref<string[]>([]);
const exportLoading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref("新增");
const isEdit = ref(false);
const queryDialogVisible = ref(false);
const formRef = ref<FormInstance | null>(null);

// ============ 查询参数 ============
const queryParams = reactive({
  orgName: "",
  pageNum: 1,
  pageSize: 20,
});

// ============ 表单 ============
const form = ref<SysAdOrg>({
  orgUuid: "",
  parentOrgUuid: "",
  orgCode: "",
  orgName: "",
  orgNameShort: "",
  orgEngName: "",
  areaCd: "",
  sjDm: "",
  shijDm: "",
  xjDm: "",
  orgAdress: "",
  postCode: "",
  email: "",
  contactTel: "",
  foundTime: "",
  legalPerson: "",
  isCorporate: "",
  isGroup: "",
  corpOrg: "",
  orgStatus: "",
  sortNo: "",
});

// ============ 省市区数据 ============
const provinceList = ref<XzqhItem[]>([]);
const cityList = ref<XzqhItem[]>([]);
const countyList = ref<XzqhItem[]>([]);

// ============ 表单校验 ============
const rules = {
  orgCode: [{ required: true, message: "请输入机构代码", trigger: "blur" }],
  orgName: [{ required: true, message: "请输入机构名称", trigger: "blur" }],
};

// ============ 方法 ============
// 加载数据
const loadData = async () => {
  try {
    const res = await request.post("sysAdOrg/queryPageList", queryParams);
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

// 加载省市区列表
const selectXzqhList = async () => {
  try {
    const res = await request.post("dmSjXzqh/selectXzqhList", {});
    if (res.code === 201) {
      provinceList.value = res.data || [];
    } else {
      ElMessage.error(res.message);
    }
  } catch {
    ElMessage.error("加载行政区划失败");
  }
};

// ============ 省市区联动 ============
// 省级选择变化
const handleProvinceChange = (provinceCode: string) => {
  // 清空下级选择
  form.value.shijDm = "";
  form.value.xjDm = "";
  cityList.value = [];
  countyList.value = [];

  if (!provinceCode) return;

  // 查找选中的省份
  const selectedProvince = provinceList.value.find(
    (item) => item.sjXzqhDm === provinceCode
  );
  if (selectedProvince?.dmShijXzqhList) {
    cityList.value = selectedProvince.dmShijXzqhList;
  }
};

// 市级选择变化
const handleCityChange = (cityCode: string) => {
  // 清空区县选择
  form.value.xjDm = "";
  countyList.value = [];

  if (!cityCode) return;

  // 查找选中的城市
  const selectedCity = cityList.value.find(
    (item) => item.shijXzqhDm === cityCode
  );
  if (selectedCity?.dmXjXzqhList) {
    countyList.value = selectedCity.dmXjXzqhList;
  }
};

// 修改时回显省市区
const setLocationData = (sjDm: string, shijDm: string, xjDm: string) => {
  // 先触发省级变化，加载市列表
  if (sjDm) {
    handleProvinceChange(sjDm);
    // 再触发市级变化，加载区县列表
    if (shijDm) {
      handleCityChange(shijDm);
    }
  }
  // 设置选中值
  form.value.sjDm = sjDm || "";
  form.value.shijDm = shijDm || "";
  form.value.xjDm = xjDm || "";
};

// ============ 查询 ============
const queryData = () => {
  queryParams.orgName = "";
  queryDialogVisible.value = true;
};

const querySubmit = () => {
  queryParams.pageNum = 1;
  loadData();
  queryDialogVisible.value = false;
};

// ============ 新增 ============
const save = () => {
  isEdit.value = false;
  dialogTitle.value = "新增";
  form.value = {
    orgUuid: "",
    parentOrgUuid: "",
    orgCode: "",
    orgName: "",
    orgNameShort: "",
    orgEngName: "",
    areaCd: "",
    sjDm: "",
    shijDm: "",
    xjDm: "",
    orgAdress: "",
    postCode: "",
    email: "",
    contactTel: "",
    foundTime: "",
    legalPerson: "",
    isCorporate: "",
    isGroup: "",
    corpOrg: "",
    orgStatus: "",
    sortNo: "",
  };
  // 清空省市区列表
  cityList.value = [];
  countyList.value = [];
  dialogVisible.value = true;
};

// ============ 修改 ============
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
    (item) => item.orgUuid === selectedIds.value[0]
  );
  if (!row) return;

  isEdit.value = true;
  dialogTitle.value = "修改";
  form.value = { ...row };

  // 回显省市区
  setLocationData(row.sjDm || "", row.shijDm || "", row.xjDm || "");

  dialogVisible.value = true;
};

// ============ 删除 ============
const deleteData = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning("请勾选要删除的项");
    return;
  }
  try {
    await ElMessageBox.confirm("确认删除选中的数据吗？", "提示", {
      type: "warning",
    });
    const res = await request.post("sysAdOrg/delete", {
      orgUuidIn: selectedIds.value,
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

// ============ 提交表单 ============
const submit = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    const api = isEdit.value ? "sysAdOrg/update" : "sysAdOrg/save";
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

// ============ 导出 ============
const excelData = async () => {
  if (exportLoading.value) return;
  exportLoading.value = true;
  try {
    await request.post(
      "sysAdOrg/exportExcel",
      {
        orgName: queryParams.orgName,
        orgUuidIn: selectedIds.value,
        pageNum: queryParams.pageNum,
        pageSize: queryParams.pageSize,
      },
      {
        responseType: "blob",
        fileName: `机构数据_${new Date()
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
const handleSelectionChange = (val: SysAdOrg[]) => {
  selectedIds.value = val.map((item) => item.orgUuid || "").filter(Boolean);
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

// ============ 生命周期 ============
onMounted(() => {
  loadData();
  selectXzqhList();
});
</script>
