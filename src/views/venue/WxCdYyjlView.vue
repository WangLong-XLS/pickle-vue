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

        <!-- 导入按钮 - 修复接口地址 -->
        <el-upload
          class="import-upload"
          :action="uploadUrl"
          :headers="{ token: token }"
          accept=".xlsx, .xls"
          :on-success="importData"
          :on-error="importError"
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
        :header-cell-style="{
          'text-align': 'center',
          'background-color': '#E3ECFF',
          color: '#333333',
          height: '35px',
          padding: '0px',
        }"
        :cell-style="{
          'text-align': 'center',
          color: '#333333',
          height: '35px',
          padding: '0px',
        }"
        style="width: 100%"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" />
        <el-table-column prop="userName" label="预约人名称" />
        <el-table-column prop="cdMc" label="预约场地" />
        <el-table-column prop="ccSd" label="预约场次" />
        <el-table-column prop="yyRq" :formatter="formatDate" label="预约日期" />
        <el-table-column prop="yyRs" label="预约人数" />
      </el-table>
    </div>

    <div style="margin-top: 10px">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="wxCdYyjl.pageNum"
        :page-sizes="[20, 50, 100, 200]"
        :page-size="wxCdYyjl.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </div>

    <div>
      <el-dialog
        :title="saveOrUpdateTitle"
        v-model="dialogFormVisible"
        width="50%"
        :close-on-click-modal="false"
      >
        <el-form :model="from" :rules="rules" ref="formRef">
          <div class="form-row">
            <div class="form-col">
              <el-form-item label="预约日期：" label-width="40%" prop="yyRq">
                <el-date-picker
                  v-model="from.yyRq"
                  type="date"
                  placeholder="请选择预约日期"
                  style="width: 70%"
                  @change="handleDateChange"
                />
              </el-form-item>
              <el-form-item
                label="场次时段："
                label-width="40%"
                prop="ccyyUuid"
              >
                <el-select
                  v-model="from.ccyyUuid"
                  placeholder="请先选择日期和场地"
                  style="width: 70%"
                  clearable
                  :disabled="!from.yyRq || !from.cdxxUuid"
                >
                  <el-option
                    v-for="item in ccSdMap"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="预约人数：" label-width="40%" prop="yyRs">
                <el-input
                  v-model="from.yyRs"
                  autocomplete="off"
                  type="number"
                  style="width: 70%"
                ></el-input>
              </el-form-item>
            </div>

            <div class="form-col">
              <el-form-item
                label="预约场地："
                label-width="40%"
                prop="cdxxUuid"
              >
                <el-select
                  v-model="from.cdxxUuid"
                  placeholder=""
                  style="width: 70%"
                  @change="handleVenueChange"
                  clearable
                >
                  <el-option
                    v-for="item in cdxxMap"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item
                label="预约人名称："
                label-width="40%"
                prop="userUuid"
              >
                <el-input
                  v-model="from.userUuid"
                  autocomplete="off"
                  style="width: 70%"
                ></el-input>
              </el-form-item>
            </div>
          </div>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="dialogFormVisible = false">取 消</el-button>
            <el-button type="primary" @click="submit()">确 定</el-button>
          </div>
        </template>
      </el-dialog>
    </div>

    <div>
      <el-dialog
        title="查询"
        v-model="queryDialogFromFlag"
        width="30%"
        :close-on-click-modal="false"
      >
        <el-form :model="wxCdYyjl">
          <el-form-item label="预约人名称：" label-width="25%">
            <el-input
              v-model="wxCdYyjl.userName"
              autocomplete="off"
              style="width: 70%"
            ></el-input>
          </el-form-item>
          <el-form-item label="场地名称：" label-width="25%">
            <el-select
              v-model="wxCdYyjl.cdxxUuid"
              placeholder=""
              style="width: 70%"
              clearable
            >
              <el-option
                v-for="item in cdxxMap"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="预约日期：" label-width="25%">
            <el-date-picker
              v-model="wxCdYyjl.yyRq"
              type="date"
              placeholder="请选择预约日期"
              style="width: 70%"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="queryDialogFromFlag = false">取消</el-button>
            <el-button type="primary" @click="queryPageList()">查询</el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<style scoped>
.lb-div {
  margin-top: 10px;
}

/* 使用 flex 布局让所有按钮对齐 */
.button-group {
  display: flex;
  align-items: center;
  gap: 30px;
}

.button-group button,
.button-group .import-upload button {
  border: none;
  background-color: transparent;
  cursor: pointer;
  color: #2962ff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.button-group .el-icon,
.button-group .import-upload .el-icon {
  font-size: 18px;
}

.button-group p,
.button-group .import-upload p {
  font-size: 12px;
  margin-top: 8px;
  margin-bottom: 0;
}

/* el-upload 容器样式 */
.button-group .import-upload {
  display: inline-flex;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -10px;
}
.form-col {
  flex: 0 0 50%;
  padding: 0 10px;
  box-sizing: border-box;
}
</style>

<script>
import request from "@/utils/request";
import {
  Search,
  CirclePlus,
  Edit,
  Delete,
  Download,
  UploadFilled,
} from "@element-plus/icons-vue";

export default {
  computed: {
    uploadUrl() {
      return `${process.env.VUE_APP_API_BASE_URL}/wxCdYyjl/importExcel`;
    },
  },

  name: "WxCdYyjlView", // 修正组件名称
  components: {
    UploadFilled,
    Search,
    CirclePlus,
    Edit,
    Delete,
    Download,
  },
  data() {
    let token = "";
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        token = user?.token || "";
      }
    } catch (e) {
      console.error("解析用户信息失败", e);
    }

    return {
      wxCdYyjl: {
        userName: "",
        cdxxUuid: "",
        yyRq: null,
        pageNum: 1,
        pageSize: 20,
      },
      tableData: [],
      total: 0,
      dialogFormVisible: false,
      infoDialogFormVisible: false,
      queryDialogFromFlag: false,
      saveOrUpdateFlag: "",
      saveOrUpdateTitle: "",
      from: {},
      originalData: {},
      yyjlUuidIn: [],
      dataBean: {},
      token: token,
      orgMap: [],
      roleMap: [],
      cdxxMap: [],
      availabilityLoading: false, // 新增：加载状态
      ccSdMap: [], // 新增：可预约场次数据（如果需要）
      fetchTimer: null, // 新增：防抖定时器
      exportLoading: false, // 新增：导出loading状态
      rules: {
        cdxxUuid: [
          { required: true, message: "请选择预约场地", trigger: "blur" },
        ],
        userUuid: [
          { required: true, message: "请输入预约人名称", trigger: "blur" },
        ],
        ccyyUuid: [
          { required: true, message: "请输入场次时段", trigger: "blur" },
        ],
        yyRs: [{ required: true, message: "请输入预约人数", trigger: "blur" }],
        yyRq: [{ required: true, message: "预约日期", trigger: "blur" }],
      },
    };
  },

  created() {
    this.load();
  },

  // 组件销毁前清除定时器
  beforeUnmount() {
    if (this.fetchTimer) {
      clearTimeout(this.fetchTimer);
    }
  },

  methods: {
    load: function () {
      this.queryPageList();
      this.loadMultipleData();
    },

    queryData() {
      this.queryDialogFromFlag = true;
      this.wxCdYyjl = {
        userName: "",
        cdxxUuid: "",
        yyRq: null,
        pageNum: 1,
        pageSize: 20,
      };
    },

    queryPageList() {
      request.post("wxCdYyjl/queryPageList", this.wxCdYyjl).then((res) => {
        if (res.code === 201) {
          this.tableData = res.data.list;
          this.total = res.data.total;
          this.queryDialogFromFlag = false;
        } else {
          this.$message.error(res.message);
        }
      });
    },

    reset() {
      this.wxCdYyjl = {
        userName: "",
        cdxxUuid: "",
        yyRq: null,
        pageNum: 1,
        pageSize: 20,
      };
      this.queryPageList();
    },

    handleSizeChange(pageSize) {
      this.wxCdYyjl.pageSize = pageSize;
      this.queryPageList();
    },

    handleCurrentChange(pageNum) {
      this.wxCdYyjl.pageNum = pageNum;
      this.queryPageList();
    },

    save() {
      this.saveOrUpdateTitle = "新增";
      this.from = {};
      this.dialogFormVisible = true;
      this.saveOrUpdateFlag = "wxCdYyjl/save";
    },

    update() {
      if (this.yyjlUuidIn.length === 0) {
        this.$message.warning("请勾选您要修改的项！");
        return;
      }
      if (this.yyjlUuidIn.length > 1) {
        this.$message.warning("只能选择一条数据修改！");
        return;
      }

      this.saveOrUpdateTitle = "修改";
      this.from = JSON.parse(JSON.stringify(this.dataBean));
      this.originalData = JSON.parse(JSON.stringify(this.dataBean));
      this.dialogFormVisible = true;
      this.saveOrUpdateFlag = "wxCdYyjl/update";
    },

    // 日期变化
    handleDateChange(val) {
      console.log("日期变化:", val);
      // 清除之前的定时器
      if (this.fetchTimer) {
        clearTimeout(this.fetchTimer);
      }
      // 延迟执行，避免频繁请求
      this.fetchTimer = setTimeout(() => {
        this.checkAndFetch();
      }, 300);
    },

    // 场地变化
    handleVenueChange(val) {
      console.log("场地变化:", val);
      // 清除之前的定时器
      if (this.fetchTimer) {
        clearTimeout(this.fetchTimer);
      }
      // 延迟执行，避免频繁请求
      this.fetchTimer = setTimeout(() => {
        this.checkAndFetch();
      }, 300);
    },

    // 失焦处理
    handleFieldBlur() {
      // 清除之前的定时器
      if (this.fetchTimer) {
        clearTimeout(this.fetchTimer);
      }
      // 检查两个字段是否都有值
      if (this.from.yyRq && this.from.cdxxUuid) {
        this.fetchAvailability();
      }
    },

    // 检查并请求（防抖版本）
    checkAndFetch() {
      if (this.from.yyRq && this.from.cdxxUuid) {
        console.log("两个字段都有值，准备请求接口");
        console.log("预约日期:", this.from.yyRq);
        console.log("预约场地:", this.from.cdxxUuid);
        this.fetchAvailability();
      } else {
        console.log("字段不完整，等待用户填写");
        // 如果字段不完整，可以清空场次选项
        if (!this.from.yyRq || !this.from.cdxxUuid) {
          this.ccSdMap = [];
        }
      }
    },

    // 请求后端接口获取可用信息
    async fetchAvailability() {
      // 防止重复请求
      if (this.availabilityLoading) {
        console.log("正在请求中，请勿重复操作");
        return;
      }

      try {
        this.availabilityLoading = true;

        const params = {
          dqRq: this.from.yyRq,
          cdxxUuid: this.from.cdxxUuid,
        };

        console.log("请求参数:", params);

        // 根据您的实际接口地址修改
        // 例如：获取可预约的场次时段、最大预约人数等信息
        const res = await request.post("wxCdCcxx/selectCcList", params);

        if (res.code === 201) {
          console.log("获取成功:", res.data);
          this.ccSdMap = res.data.map((item) => ({
            label: item.ccSd,
            value: item.ccyyUuid,
          }));
        } else {
          this.$message.error(res.message || "获取可用信息失败");
          // 清空相关选项
          this.ccSdMap = [];
        }
      } catch (error) {
        console.error("请求失败:", error);
        this.$message.error("网络错误，请稍后重试");
        this.ccSdMap = [];
      } finally {
        this.availabilityLoading = false;
      }
    },

    submit() {
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          request.post(this.saveOrUpdateFlag, this.from).then((res) => {
            if (res.code === 201) {
              this.$message({
                message: res.message,
                type: "success",
              });
              this.dialogFormVisible = false;
              this.yyjlUuidIn = [];
              this.reset();
            } else {
              this.$message.error(res.message);
            }
          });
        } else {
          this.$message.error("请完善信息");
          return false;
        }
      });
    },

    deleteData() {
      if (this.yyjlUuidIn.length === 0) {
        this.$message.warning("请勾选您要删除的项！");
        return;
      }

      const data = {
        yyjlUuidIn: this.yyjlUuidIn,
      };
      request.post("wxCdYyjl/delete", data).then((res) => {
        if (res.code === 201) {
          this.$message({
            message: res.message,
            type: "success",
          });
          this.yyjlUuidIn = [];
          this.reset();
        } else {
          this.$message.error(res.message);
        }
      });
    },

    // 修复导出方法
    async excelData() {
      // 防止重复导出
      if (this.exportLoading) {
        return;
      }

      this.exportLoading = true;

      try {
        const excelData = {
          userName: this.wxCdYyjl.userName,
          cdxxUuid: this.wxCdYyjl.cdxxUuid,
          yyRq: this.wxCdYyjl.yyRq,
          yyjlUuidIn: this.yyjlUuidIn,
          pageNum: this.wxCdYyjl.pageNum,
          pageSize: this.wxCdYyjl.pageSize,
        };

        // request.ts 会自动处理 blob 并下载文件
        await request.post("wxCdYyjl/exportExcel", excelData, {
          responseType: "blob",
          fileName: `场地信息_${new Date()
            .toISOString()
            .slice(0, 19)
            .replace(/:/g, "-")}.xlsx`,
        });

        // 导出成功提示（注意：blob响应不会返回code，所以这里直接提示成功）
        this.$message.success("导出成功");
      } catch (error) {
        console.error("导出失败:", error);
        // 如果后端返回了错误信息（JSON格式），尝试解析
        if (error.response?.data) {
          try {
            const text = await error.response.data.text();
            const errorData = JSON.parse(text);
            this.$message.error(errorData.message || "导出失败");
          } catch (e) {
            this.$message.error("导出失败，请稍后重试");
          }
        } else {
          this.$message.error(error.message || "导出失败");
        }
      } finally {
        this.exportLoading = false;
      }
    },

    importData(res) {
      if (res.code === 201) {
        this.$message({
          message: res.message,
          type: "success",
        });
        this.reset();
      } else {
        this.$message.error(res.message);
      }
    },

    // 新增：导入失败回调
    importError(error) {
      console.error("导入失败:", error);
      this.$message.error("导入失败，请检查文件格式或网络连接");
    },

    handleSelectionChange(val) {
      this.yyjlUuidIn = [];
      val.forEach((item) => {
        if (item.ccyyUuid) {
          this.yyjlUuidIn.push(item.ccyyUuid);
          this.dataBean = item;
        }
      });
    },

    formatDate(row, column, cellValue) {
      if (!cellValue) return "";
      const date = new Date(cellValue);
      return `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
    },

    async loadMultipleData() {
      const [sysAdOrg, sysRole, wxCdCdxx] = await Promise.all([
        request.post("sysAdOrg/selectOrgCode2OrgNameMap", this.from),
        request.post("sysRole/selectListByBean", this.from),
        request.post("wxCdCdxx/selectListByBean", this.from),
        request.post("wxCdCdxx/selectListByBean", this.from),
      ]);
      if (sysAdOrg.code === 201) {
        this.orgMap = this.transformOrgData(sysAdOrg.data);
      } else {
        this.$message.error(sysAdOrg.message);
      }

      if (sysRole.code === 201) {
        this.roleMap = sysRole.data.map((item) => ({
          label: item.roleName,
          value: item.roleUuid,
        }));
      } else {
        this.$message.error(sysRole.message);
      }

      if (wxCdCdxx.code === 201) {
        this.cdxxMap = wxCdCdxx.data.map((item) => ({
          label: item.cdMc,
          value: item.cdxxUuid,
        }));
      } else {
        this.$message.error(wxCdCdxx.message);
      }
    },

    transformOrgData(data) {
      return Object.keys(data).map((key) => {
        return {
          value: key,
          label: data[key],
        };
      });
    },
  },
};
</script>
