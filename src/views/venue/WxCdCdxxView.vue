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
          action="http://localhost:8888/pickle/wxCdCdxx/importExcel"
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
        <el-table-column prop="cdMc" label="场地名称" />
        <el-table-column prop="cdGdRs" label="场地规定人数" />
        <el-table-column prop="bz" label="备注" />
      </el-table>
    </div>

    <div style="margin-top: 10px">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="wxCdCdxx.pageNum"
        :page-sizes="[20, 50, 100, 200]"
        :page-size="wxCdCdxx.pageSize"
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
              <el-form-item label="场地名称：" label-width="40%" prop="cdMc">
                <el-input
                  v-model="from.cdMc"
                  autocomplete="off"
                  style="width: 70%"
                ></el-input>
              </el-form-item>
              <el-form-item
                label="场地规定人数："
                label-width="40%"
                prop="cdGdRs"
              >
                <el-input
                  v-model.number="from.cdGdRs"
                  autocomplete="off"
                  style="width: 70%"
                  type="number"
                ></el-input>
              </el-form-item>
            </div>

            <div class="form-col">
              <el-form-item label="备注：" label-width="40%" prop="bz">
                <el-input
                  v-model="from.bz"
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
        <el-form :model="wxCdCdxx">
          <el-form-item label="场地名称：" label-width="25%">
            <el-input
              v-model="wxCdCdxx.cdMc"
              autocomplete="off"
              style="width: 50%"
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
import {
  Search,
  CirclePlus,
  Edit,
  Delete,
  Download,
  UploadFilled,
} from "@element-plus/icons-vue";

export default {
  name: "WxCdCdxxView", // 修正组件名称
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
      wxCdCdxx: {
        cdMc: "",
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
      cdxxUuidIn: [],
      dataBean: {},
      token: token,
      orgMap: [],
      roleMap: [],
      exportLoading: false, // 新增：导出loading状态
      rules: {
        cdMc: [{ required: true, message: "请输入场地名称", trigger: "blur" }],
        cdGdRs: [
          { required: true, message: "请输入场地规定人数", trigger: "blur" },
        ],
      },
    };
  },

  created() {
    this.load();
  },

  methods: {
    load: function () {
      this.queryPageList();
      this.selectOrgCode2OrgNameMap();
      this.selectListByBean();
    },

    queryData() {
      this.queryDialogFromFlag = true;
    },

    queryPageList() {
      request.post("wxCdCdxx/queryPageList", this.wxCdCdxx).then((res) => {
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
      this.wxCdCdxx = {
        cdMc: "",
        pageNum: 1,
        pageSize: 20,
      };
      this.queryPageList();
    },

    handleSizeChange(pageSize) {
      this.wxCdCdxx.pageSize = pageSize;
      this.queryPageList();
    },

    handleCurrentChange(pageNum) {
      this.wxCdCdxx.pageNum = pageNum;
      this.queryPageList();
    },

    save() {
      this.saveOrUpdateTitle = "新增";
      this.from = {};
      this.dialogFormVisible = true;
      this.saveOrUpdateFlag = "wxCdCdxx/save";
    },

    update() {
      if (this.cdxxUuidIn.length === 0) {
        this.$message.warning("请勾选您要修改的项！");
        return;
      }
      if (this.cdxxUuidIn.length > 1) {
        this.$message.warning("只能选择一条数据修改！");
        return;
      }

      this.saveOrUpdateTitle = "修改";
      this.from = JSON.parse(JSON.stringify(this.dataBean));
      this.originalData = JSON.parse(JSON.stringify(this.dataBean));
      this.dialogFormVisible = true;
      this.saveOrUpdateFlag = "wxCdCdxx/update";
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
              this.cdxxUuidIn = [];
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
      if (this.cdxxUuidIn.length === 0) {
        this.$message.warning("请勾选您要删除的项！");
        return;
      }

      const data = {
        cdxxUuidIn: this.cdxxUuidIn,
      };
      request.post("wxCdCdxx/delete", data).then((res) => {
        if (res.code === 201) {
          this.$message({
            message: res.message,
            type: "success",
          });
          this.cdxxUuidIn = [];
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
          cdMc: this.wxCdCdxx.cdMc,
          cdxxUuidIn: this.cdxxUuidIn,
          pageNum: this.wxCdCdxx.pageNum,
          pageSize: this.wxCdCdxx.pageSize,
        };

        // request.ts 会自动处理 blob 并下载文件
        await request.post("wxCdCdxx/exportExcel", excelData, {
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
      this.cdxxUuidIn = [];
      val.forEach((item) => {
        if (item.cdxxUuid) {
          this.cdxxUuidIn.push(item.cdxxUuid);
          this.dataBean = item;
        }
      });
    },

    selectOrgCode2OrgNameMap() {
      request
        .post("sysAdOrg/selectOrgCode2OrgNameMap", this.from)
        .then((res) => {
          if (res.code === 201) {
            this.orgMap = this.transformOrgData(res.data);
          } else {
            this.$message.error(res.message);
          }
        });
    },

    transformOrgData(data) {
      return Object.keys(data).map((key) => {
        return {
          value: key,
          label: data[key],
        };
      });
    },

    selectListByBean() {
      request.post("sysRole/selectListByBean", this.from).then((res) => {
        if (res.code === 201) {
          this.roleMap = res.data.map((item) => ({
            label: item.roleName,
            value: item.roleUuid,
          }));
        } else {
          this.$message.error(res.message);
        }
      });
    },
  },
};
</script>
