<template>
  <div>
    <div class="tb-div">
      <button>
        <i class="el-icon-search" @click="queryData()"></i>
        <p>查询</p>
      </button>
      <button>
        <i class="el-icon-circle-plus-outline" @click="save()"></i>
        <p>新增</p>
      </button>
      <button>
        <i class="el-icon-edit" @click="update()"></i>
        <p>修改</p>
      </button>
      <button>
        <i class="el-icon-delete" @click="deleteData()"></i>
        <p>删除</p>
      </button>
      <button>
        <i class="el-icon-download" @click="excelData()"></i>
        <p>导出</p>
      </button>
      <button>
        <el-upload
          :action="uploadUrl"
          :headers="{ token: this.token }"
          accept=".xlsx, .xls"
          :on-success="importData"
          :show-file-list="false"
        >
          <i class="el-icon-upload2"></i>
          <p>导入</p>
        </el-upload>
      </button>
    </div>

    <div class="lb-div">
      <el-table
        :data="tableData"
        class="data-table"
        :header-cell-style="{
          'text-align': 'center',
          'background-color': '#E3ECFF',
          color: '#333333',
          height: '35px', // 表头行高
          padding: '0px', // 去掉内边距
        }"
        :cell-style="{
          'text-align': 'center',
          color: '#333333',
          height: '35px', // 表头行高
          padding: '0px', // 去掉内边距
        }"
        style="width: 100%"
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

    <div style="margin-top: 10px">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="sysRole.pageNum"
        :page-sizes="[20, 50, 100, 200]"
        :page-size="sysRole.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </div>

    <div>
      <el-dialog
        :title="saveOrUpdateTitle"
        v-model="queryDialogFromFlag"
        width="50%"
        :close-on-click-modal="false"
      >
        <el-form :model="from" :rules="rules" ref="formRef">
          <div class="form-row">
            <div class="form-col">
              <el-form-item
                label="角色编码："
                label-width="40%"
                prop="roleCode"
              >
                <el-input
                  v-model="from.roleCode"
                  autocomplete="off"
                  style="width: 70%"
                ></el-input>
              </el-form-item>
              <el-form-item label="角色描述：" label-width="40%">
                <el-input
                  v-model="from.roleDesc"
                  autocomplete="off"
                  style="width: 70%"
                ></el-input>
              </el-form-item>
              <el-form-item label="行政机构：" label-width="40%">
                <el-select
                  v-model="from.orgUuid"
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

            <div class="form-col">
              <el-form-item
                label="角色名称："
                label-width="40%"
                prop="roleName"
              >
                <el-input
                  v-model="from.roleName"
                  autocomplete="off"
                  style="width: 70%"
                ></el-input>
              </el-form-item>
              <el-form-item label="公用标志Y/N：" label-width="40%">
                <el-select
                  v-model="from.pubFlg"
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
        <el-form :model="sysRole">
          <el-form-item label="角色名称：" label-width="25%">
            <el-input
              v-model="sysRole.roleName"
              autocomplete="off"
              style="width: 50%"
            ></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="dialogFormVisible = false">取 消</el-button>
            <el-button type="primary" @click="submit()">确 定</el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<style scoped>
.lb-div {
  margin-top: 10px; /* 上方div间距 */
}

.tb-div button {
  border: none;
  background-color: transparent;
  line-height: 0;
  margin-right: 50px;
  cursor: pointer;
  color: #2962ff;
}
.tb-div i {
  font-size: 18px;
}
.tb-div p {
  font-size: 12px;
  margin-top: 10px;
  margin-bottom: 10px;
}

.el-dialog {
  border-radius: 15px !important;
  overflow: hidden;
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

export default {
  computed: {
    uploadUrl() {
      return `${process.env.VUE_APP_API_BASE_URL}/sysRole/importExcel`;
    },
  },

  data() {
    return {
      sysRole: {
        roleName: "",
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
      roleUuidIn: [],
      dataBean: {},
      token: JSON.parse(localStorage.getItem("user")).token,
      orgMap: [],
      rules: {
        roleCode: [
          { required: true, message: "请输入角色编码", trigger: "blur" },
        ],
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "change" },
        ],
      },
    };
  },

  //页面加载的时候做一些事情
  created() {
    this.load();
  },
  //定义一些页面上的控件触发事件调用的方法
  methods: {
    load: function () {
      this.queryPageList();
      this.selectOrgCode2OrgNameMap();
    },

    queryData() {
      this.queryDialogFromFlag = true;
    },

    queryPageList() {
      request.post("sysRole/queryPageList", this.sysRole).then((res) => {
        if (res.code === 201) {
          this.tableData = res.data.list;
          this.total = res.data.total;
          this.sysRole = {
            roleName: "",
            pageNum: 1,
            pageSize: 20,
          };
          this.queryDialogFromFlag = false;
        } else {
          this.$message.error(res.message);
        }
      });
    },

    reset() {
      this.sysRole = {
        roleName: "",
        pageNum: 1,
        pageSize: 20,
      };
      this.queryPageList();
    },

    handleSizeChange(pageSize) {
      this.sysRole.pageSize = pageSize;
      this.queryPageList();
    },

    handleCurrentChange(pageNum) {
      this.sysRole.pageNum = pageNum;
      this.queryPageList();
    },

    save() {
      this.saveOrUpdateTitle = "新增";
      this.from = {};
      this.dialogFormVisible = true;
      this.saveOrUpdateFlag = "sysRole/save";
    },

    update() {
      if (this.roleUuidIn.length === 0) {
        this.$message.warning("请勾选您要修改的项！");
        return;
      }
      if (this.roleUuidIn.length > 1) {
        this.$message.warning("只能选择一条数据修改！");
        return;
      }

      this.saveOrUpdateTitle = "修改";
      this.from = JSON.parse(JSON.stringify(this.dataBean)); // 用副本进行编辑
      this.originalData = JSON.parse(JSON.stringify(this.dataBean)); // 深拷贝原始数据
      this.dialogFormVisible = true;
      this.saveOrUpdateFlag = "sysRole/update";
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
              this.roleUuidIn = [];
              this.reset();
            } else {
              this.$message.error(res.message);
            }
          });
        } else {
          this.$message.error("请完善必填信息");
          return false;
        }
      });
    },

    deleteData(data) {
      if (this.roleUuidIn.length === 0) {
        this.$message.warning("请勾选您要删除的项！");
        return;
      }

      data = {
        roleUuidIn: this.roleUuidIn,
      };
      request.post("sysRole/delete", data).then((res) => {
        if (res.code === 201) {
          this.$message({
            message: res.message,
            type: "success",
          });
          this.dialogFormVisible = false;
          this.roleUuidIn = [];
          this.reset();
        } else {
          this.$message.error(res.message);
        }
      });
      this.reset();
    },

    excelData(excelData) {
      excelData = {
        roleName: this.sysRole.roleName,
        roleUuidIn: this.roleUuidIn,
      };

      request.post("/sysRole/exportExcel", excelData, {
        responseType: "blob",
        fileName: "赛事基本信息.xlsx",
      });
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

    handleSelectionChange(val) {
      this.roleUuidIn = [];
      // 遍历并收集UUID
      val.forEach((item) => {
        if (item.roleUuid) {
          this.roleUuidIn.push(item.roleUuid);
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

    formatDateStr(cellValue) {
      if (!cellValue) return "";
      const date = new Date(cellValue);
      return `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
    },

    selectOrgCode2OrgNameMap() {
      request
        .post("sysAdOrg/selectOrgCode2OrgNameMap", this.from)
        .then((res) => {
          if (res.code === 201) {
            // 转换数据格式
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
  },
};
</script>
