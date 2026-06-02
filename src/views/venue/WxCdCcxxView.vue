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
        <el-table-column prop="cdMc" label="场地名称" />
        <el-table-column prop="ccSd" label="场次时段" />
        <el-table-column prop="cdDj" label="场地单价" />
        <el-table-column prop="hjtBzMc" label="是否黄金天" />
        <el-table-column prop="pxh" label="排序号" />
      </el-table>
    </div>

    <div style="margin-top: 10px">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="wxCdCcxx.pageNum"
        :page-sizes="[20, 50, 100, 200]"
        :page-size="wxCdCcxx.pageSize"
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
              <el-form-item
                label="场地名称："
                label-width="40%"
                prop="cdxxUuid"
              >
                <el-select
                  v-model="from.cdxxUuid"
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
              <el-form-item label="场地单价：" label-width="40%" prop="cdDj">
                <el-input
                  v-model="from.cdDj"
                  autocomplete="off"
                  type="number"
                  style="width: 70%"
                ></el-input>
              </el-form-item>
              <el-form-item label="排序号：" label-width="40%" prop="pxh">
                <el-input
                  v-model="from.pxh"
                  autocomplete="off"
                  style="width: 70%"
                ></el-input>
              </el-form-item>
            </div>

            <div class="form-col">
              <el-form-item label="场次时段：" label-width="40%" prop="ccSd">
                <el-input
                  v-model="from.ccSd"
                  autocomplete="off"
                  style="width: 70%"
                ></el-input>
              </el-form-item>
              <el-form-item label="是否黄金天：" label-width="40%" prop="hjtBz">
                <el-select
                  v-model="from.hjtBz"
                  placeholder=""
                  style="width: 70%"
                >
                  <el-option label="是" value="Y" />
                  <el-option label="否" value="N" />
                </el-select>
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
        <el-form :model="wxCdCcxx">
          <el-form-item label="场地名称：" label-width="25%">
            <el-select
              v-model="wxCdCcxx.cdxxUuid"
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
          <el-form-item label="是否黄金天：" label-width="25%">
            <el-select
              v-model="wxCdCcxx.hjtBz"
              placeholder=""
              style="width: 70%"
            >
              <el-option label="是" value="Y" />
              <el-option label="否" value="N" />
            </el-select>
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
      return `${process.env.VUE_APP_API_BASE_URL}/wxCdCcxx/importExcel`;
    },
  },

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
      wxCdCcxx: {
        cdxxUuid: "",
        hjtBz: "",
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
      ccyyUuidIn: [],
      dataBean: {},
      token: token,
      orgMap: [],
      roleMap: [],
      cdxxMap: [],
      exportLoading: false, // 新增：导出loading状态
      rules: {
        cdxxUuid: [
          { required: true, message: "请选择场地名称", trigger: "blur" },
        ],
        ccSd: [{ required: true, message: "请输入场次时段", trigger: "blur" }],
        cdDj: [{ required: true, message: "请输入场地单价", trigger: "blur" }],
        hjtBz: [
          { required: true, message: "请选择是否黄金天", trigger: "blur" },
        ],
        pxh: [{ required: true, message: "请输入排序号", trigger: "blur" }],
      },
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
      this.wxCdCcxx = {
        cdxxUuid: "",
        hjtBz: "",
        pageNum: 1,
        pageSize: 20,
      };
    },

    queryPageList() {
      request.post("wxCdCcxx/queryPageList", this.wxCdCcxx).then((res) => {
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
      this.wxCdCcxx = {
        cdxxUuid: "",
        hjtBz: "",
        pageNum: 1,
        pageSize: 20,
      };
      this.queryPageList();
    },

    handleSizeChange(pageSize) {
      this.wxCdCcxx.pageSize = pageSize;
      this.queryPageList();
    },

    handleCurrentChange(pageNum) {
      this.wxCdCcxx.pageNum = pageNum;
      this.queryPageList();
    },

    save() {
      this.saveOrUpdateTitle = "新增";
      this.from = {};
      this.dialogFormVisible = true;
      this.saveOrUpdateFlag = "wxCdCcxx/save";
    },

    update() {
      if (this.ccyyUuidIn.length === 0) {
        this.$message.warning("请勾选您要修改的项！");
        return;
      }
      if (this.ccyyUuidIn.length > 1) {
        this.$message.warning("只能选择一条数据修改！");
        return;
      }

      this.saveOrUpdateTitle = "修改";
      this.from = JSON.parse(JSON.stringify(this.dataBean));
      this.originalData = JSON.parse(JSON.stringify(this.dataBean));
      this.dialogFormVisible = true;
      this.saveOrUpdateFlag = "wxCdCcxx/update";
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
              this.ccyyUuidIn = [];
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
      if (this.ccyyUuidIn.length === 0) {
        this.$message.warning("请勾选您要删除的项！");
        return;
      }

      const data = {
        ccyyUuidIn: this.ccyyUuidIn,
      };
      request.post("wxCdCcxx/delete", data).then((res) => {
        if (res.code === 201) {
          this.$message({
            message: res.message,
            type: "success",
          });
          this.ccyyUuidIn = [];
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
          cdMc: this.wxCdCcxx.cdMc,
          ccyyUuidIn: this.ccyyUuidIn,
          pageNum: this.wxCdCcxx.pageNum,
          pageSize: this.wxCdCcxx.pageSize,
        };

        // request.ts 会自动处理 blob 并下载文件
        await request.post("wxCdCcxx/exportExcel", excelData, {
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
      this.ccyyUuidIn = [];
      val.forEach((item) => {
        if (item.ccyyUuid) {
          this.ccyyUuidIn.push(item.ccyyUuid);
          this.dataBean = item;
        }
      });
    },

    async loadMultipleData() {
      const [sysAdOrg, sysRole, wxCdCdxx] = await Promise.all([
        request.post("sysAdOrg/selectOrgCode2OrgNameMap", this.from),
        request.post("sysRole/selectListByBean", this.from),
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
