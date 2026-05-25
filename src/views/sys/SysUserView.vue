<template>
  <div>
    <div class="tb-div">
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
      <button @click="excelData()">
        <el-icon><Download /></el-icon>
        <p>导出</p>
      </button>
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
        <el-table-column prop="userAge" label="用户年龄" />
        <el-table-column prop="userSexName" label="用户性别" />
        <el-table-column prop="userPhone" label="用户手机号" />
        <el-table-column prop="orgName" label="所属机构" />
        <el-table-column prop="roleName" label="角色名称" />
      </el-table>
    </div>

    <div style="margin-top: 10px">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="sysUser.pageNum"
        :page-sizes="[20, 50, 100, 200]"
        :page-size="sysUser.pageSize"
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
              <el-form-item label="用户名：" label-width="40%" prop="userName">
                <el-input
                  v-model="from.userName"
                  autocomplete="off"
                  style="width: 70%"
                ></el-input>
              </el-form-item>
              <el-form-item label="用户年龄：" label-width="40%" prop="userAge">
                <el-input
                  v-model="from.userAge"
                  autocomplete="off"
                  style="width: 70%"
                ></el-input>
              </el-form-item>
              <el-form-item label="用户手机号：" label-width="40%">
                <el-input
                  v-model="from.userPhone"
                  autocomplete="off"
                  style="width: 70%"
                ></el-input>
              </el-form-item>
              <el-form-item
                label="关联角色："
                label-width="40%"
                prop="roleUuid"
              >
                <el-select
                  v-model="from.roleUuid"
                  placeholder="请选择角色"
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
            </div>

            <div class="form-col">
              <el-form-item
                label="用户密码"
                label-width="40%"
                prop="userPassword"
              >
                <el-input
                  v-model="from.userPassword"
                  autocomplete="off"
                  style="width: 70%"
                  show-password
                ></el-input>
              </el-form-item>
              <el-form-item label="用户性别：" label-width="40%">
                <el-select
                  v-model="from.userSex"
                  placeholder="请选择性别"
                  style="width: 70%"
                >
                  <el-option label="男" value="M" />
                  <el-option label="女" value="W" />
                </el-select>
              </el-form-item>
              <el-form-item label="所属机构：" label-width="40%" prop="orgCode">
                <el-select
                  v-model="from.orgCode"
                  placeholder="请选择机构"
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
        <el-form :model="sysUser">
          <el-form-item label="用户名：" label-width="25%">
            <el-input
              v-model="sysUser.userName"
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

.tb-div button {
  border: none;
  background-color: transparent;
  line-height: 0;
  margin-right: 50px;
  cursor: pointer;
  color: #2962ff;
}
.tb-div .el-icon {
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
import {
  Search,
  CirclePlus,
  Edit,
  Delete,
  Download,
} from "@element-plus/icons-vue";

export default {
  name: "SysUserView",
  components: {
    Search,
    CirclePlus,
    Edit,
    Delete,
    Download,
  },
  data() {
    // 安全获取 token
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
      sysUser: {
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
      rules: {
        userName: [
          { required: true, message: "请输入用户名", trigger: "blur" },
        ],
        userPassword: [
          { required: true, message: "请输入用户密码", trigger: "blur" },
        ],
        orgCode: [{ required: true, message: "请选择机构", trigger: "blur" }],
        userAge: [{ validator: this.validateAge, trigger: "blur" }],
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
      request.post("sysUser/queryPageList", this.sysUser).then((res) => {
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
      this.sysUser = {
        userName: "",
        userPhone: "",
        pageNum: 1,
        pageSize: 20,
      };
      this.queryPageList();
    },

    handleSizeChange(pageSize) {
      this.sysUser.pageSize = pageSize;
      this.queryPageList();
    },

    handleCurrentChange(pageNum) {
      this.sysUser.pageNum = pageNum;
      this.queryPageList();
    },

    validateAge(rule, value, callback) {
      if (value !== null && value !== "") {
        let num = Number(value);
        if (!Number.isInteger(num)) {
          callback(new Error("年龄必须为整数"));
        } else if (value < 0) {
          callback(new Error("年龄不能为负数"));
        } else if (value > 150) {
          callback(new Error("年龄不能超过150岁"));
        } else {
          callback();
        }
      } else {
        callback();
      }
    },

    save() {
      this.saveOrUpdateTitle = "新增";
      this.from = {};
      this.dialogFormVisible = true;
      this.saveOrUpdateFlag = "sysUser/save";
    },

    update() {
      if (this.userUuidIn.length === 0) {
        this.$message.warning("请勾选您要修改的项！");
        return;
      }
      if (this.userUuidIn.length > 1) {
        this.$message.warning("只能选择一条数据修改！");
        return;
      }

      this.saveOrUpdateTitle = "修改";
      this.from = JSON.parse(JSON.stringify(this.dataBean));
      this.originalData = JSON.parse(JSON.stringify(this.dataBean));
      this.dialogFormVisible = true;
      this.saveOrUpdateFlag = "sysUser/update";
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
              this.userUuidIn = [];
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
      if (this.userUuidIn.length === 0) {
        this.$message.warning("请勾选您要删除的项！");
        return;
      }

      const data = {
        userUuidIn: this.userUuidIn,
      };
      request.post("sysUser/delete", data).then((res) => {
        if (res.code === 201) {
          this.$message({
            message: res.message,
            type: "success",
          });
          this.userUuidIn = [];
          this.reset();
        } else {
          this.$message.error(res.message);
        }
      });
    },

    excelData() {
      const excelData = {
        userName: this.sysUser.userName,
        userPhone: this.sysUser.userPhone,
        userUuidIn: this.userUuidIn,
      };

      request.post("sysUser/exportExcel", excelData, {
        responseType: "blob",
      });
    },

    handleSelectionChange(val) {
      this.userUuidIn = [];
      val.forEach((item) => {
        if (item.userUuid) {
          this.userUuidIn.push(item.userUuid);
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
