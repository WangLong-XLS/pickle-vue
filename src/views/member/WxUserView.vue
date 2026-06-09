<template>
  <div>
    <div class="tb-div">
      <div class="button-group">
        <button @click="queryData()">
          <el-icon><Search /></el-icon>
          <p>查询</p>
        </button>
        <button @click="excelData()" :disabled="exportLoading">
          <el-icon><Download /></el-icon>
          <p>{{ exportLoading ? "导出中..." : "导出" }}</p>
        </button>
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
        <el-table-column prop="userName" label="用户名" />
        <el-table-column prop="userCode" label="用户账号" />
        <el-table-column prop="userImage" label="用户头像" />
        <el-table-column prop="userSexMc" label="用户性别" />
        <el-table-column prop="userPhone" label="用户手机号" />
      </el-table>
    </div>

    <div style="margin-top: 10px">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="wxUser.pageNum"
        :page-sizes="[20, 50, 100, 200]"
        :page-size="wxUser.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </div>

    <div>
      <el-dialog
        title="查询"
        v-model="queryDialogFromFlag"
        width="30%"
        :close-on-click-modal="false"
      >
        <el-form :model="wxUser">
          <el-form-item label="用户名：" label-width="25%">
            <el-input
              v-model="wxUser.userName"
              autocomplete="off"
              style="width: 70%"
            ></el-input>
          </el-form-item>
          <el-form-item label="用户手机号：" label-width="25%">
            <el-input
              v-model="wxUser.userPhone"
              autocomplete="off"
              style="width: 70%"
            ></el-input>
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
import { Search, Download } from "@element-plus/icons-vue";

export default {
  name: "WxUserView", // 修正组件名称
  components: {
    Search,
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
      wxUser: {
        userName: "",
        userPhone: "",
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
      userUuidIn: [],
      dataBean: {},
      token: token,
      orgMap: [],
      roleMap: [],
      cdxxMap: [],
      availabilityLoading: false, // 新增：加载状态
      ccSdMap: [], // 新增：可预约场次数据（如果需要）
      fetchTimer: null, // 新增：防抖定时器
      exportLoading: false, // 新增：导出loading状态
    };
  },

  created() {
    this.load();
  },

  methods: {
    load: function () {
      this.queryPageList();
      this.loadMultipleData();
    },

    queryData() {
      this.queryDialogFromFlag = true;
      this.wxUser = {
        userName: "",
        userPhone: "",
        pageNum: 1,
        pageSize: 20,
      };
    },

    queryPageList() {
      request.post("wxUser/queryPageList", this.wxUser).then((res) => {
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
      this.wxUser = {
        userName: "",
        userPhone: "",
        pageNum: 1,
        pageSize: 20,
      };
      this.queryPageList();
    },

    handleSizeChange(pageSize) {
      this.wxUser.pageSize = pageSize;
      this.queryPageList();
    },

    handleCurrentChange(pageNum) {
      this.wxUser.pageNum = pageNum;
      this.queryPageList();
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
          userName: this.wxUser.userName,
          userPhone: this.wxUser.userPhone,
          userUuidIn: this.userUuidIn,
          pageNum: this.wxUser.pageNum,
          pageSize: this.wxUser.pageSize,
        };

        // request.ts 会自动处理 blob 并下载文件
        await request.post("wxUser/exportExcel", excelData, {
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

    handleSelectionChange(val) {
      this.userUuidIn = [];
      val.forEach((item) => {
        if (item.ccyyUuid) {
          this.userUuidIn.push(item.ccyyUuid);
          this.dataBean = item;
        }
      });
    },

    async loadMultipleData() {
      const [sysAdOrg, sysRole] = await Promise.all([
        request.post("sysAdOrg/selectOrgCode2OrgNameMap", this.from),
        request.post("sysRole/selectListByBean", this.from),
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
