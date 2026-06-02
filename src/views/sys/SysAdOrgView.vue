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
        <el-table-column
          prop="orgCode"
          label="机构代码"
          width="150"
          show-overflow-tooltip
        />
        <el-table-column
          prop="orgName"
          label="机构名称"
          width="200"
          show-overflow-tooltip
        />
        <el-table-column
          prop="parentOrgUuid"
          label="上级机构"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="orgNameShort"
          label="机构简称"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="orgEngName"
          label="机构英文名称"
          width="150"
          show-overflow-tooltip
        />
        <el-table-column
          prop="areaCd"
          label="国家地区代码"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="sjMc"
          label="省级代码"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="shijMc"
          label="市级代码"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="xjMc"
          label="县级代码"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="orgAdress"
          label="详细地址"
          width="200"
          show-overflow-tooltip
        />
        <el-table-column
          prop="postCode"
          label="邮编"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="email"
          label="电子邮箱"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="contactTel"
          label="联系电话"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="foundTime"
          label="成立日期"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="legalPerson"
          label="法定代表人"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="isCorporateName"
          label="是否法人机构"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="isGroupName"
          label="是否集团"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="corpOrg"
          label="所属法人机构"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="orgStatus"
          label="所属集团"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="sortNo"
          label="机构排序号"
          width="120"
          show-overflow-tooltip
        />
      </el-table>
    </div>

    <div style="margin-top: 10px">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="sysAdOrg.pageNum"
        :page-sizes="[20, 50, 100, 200]"
        :page-size="sysAdOrg.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </div>

    <div>
      <el-dialog
        :title="saveOrUpdateTitle"
        v-model="queryDialogFromFlag"
        width="80%"
        :close-on-click-modal="false"
      >
        <el-form :model="from" :rules="rules" ref="formRef">
          <div class="form-row">
            <div class="form-col">
              <el-form-item label="机构代码：" label-width="40%" prop="orgCode">
                <el-input
                  v-model="from.orgCode"
                  autocomplete="off"
                  style="width: 70%"
                ></el-input>
              </el-form-item>
              <el-form-item label="机构名称：" label-width="40%" prop="orgName">
                <el-input
                  v-model="from.orgName"
                  autocomplete="off"
                  style="width: 70%"
                ></el-input>
              </el-form-item>
              <el-form-item
                label="上级机构："
                label-width="40%"
                prop="parentOrgUuid"
              >
                <el-input
                  v-model="from.parentOrgUuid"
                  autocomplete="off"
                  style="width: 70%"
                ></el-input>
              </el-form-item>
              <el-form-item label="机构简称：" label-width="40%">
                <el-input
                  v-model="from.orgNameShort"
                  autocomplete="off"
                  style="width: 70%"
                ></el-input>
              </el-form-item>
              <el-form-item label="机构英文名称：" label-width="40%">
                <el-input
                  v-model="from.orgEngName"
                  autocomplete="off"
                  style="width: 70%"
                ></el-input>
              </el-form-item>
            </div>
            <div class="form-col">
              <el-form-item label="国家地区代码：" label-width="40%">
                <el-input
                  v-model="from.areaCd"
                  autocomplete="off"
                  style="width: 70%"
                ></el-input>
              </el-form-item>
              <el-form-item label="邮编：" label-width="40%">
                <el-input
                  v-model="from.postCode"
                  autocomplete="off"
                  style="width: 70%"
                ></el-input>
              </el-form-item>
              <el-form-item label="电子邮箱：" label-width="40%">
                <el-input
                  v-model="from.email"
                  autocomplete="off"
                  style="width: 70%"
                ></el-input>
              </el-form-item>
              <el-form-item label="联系电话：" label-width="40%">
                <el-input
                  v-model="from.contactTel"
                  autocomplete="off"
                  style="width: 70%"
                ></el-input>
              </el-form-item>
              <el-form-item label="成立日期：" label-width="40%">
                <el-input
                  v-model="from.foundTime"
                  autocomplete="off"
                  style="width: 70%"
                ></el-input>
              </el-form-item>
            </div>

            <div class="form-col">
              <el-form-item label="法定代表人：" label-width="40%">
                <el-input
                  v-model="from.legalPerson"
                  autocomplete="off"
                  style="width: 70%"
                ></el-input>
              </el-form-item>
              <el-form-item label="是否法人机构：" label-width="40%">
                <el-select
                  v-model="from.isCorporate"
                  placeholder=""
                  style="width: 70%"
                >
                  <el-option label="是" value="Y" />
                  <el-option label="否" value="N" />
                </el-select>
              </el-form-item>
              <el-form-item
                label="所在地："
                label-width="40%"
                prop="location"
                class="location-form-item"
              >
                <el-select
                  v-model="from.sjDm"
                  @change="handleProvinceChange"
                  class="location-select"
                  clearable
                >
                  <el-option
                    v-for="province in provinceList"
                    :key="province.sjXzqhDm"
                    :label="province.sjXzqhMc"
                    :value="province.sjXzqhDm"
                  />
                </el-select>
                <el-select
                  v-model="from.shijDm"
                  @change="handleCityChange"
                  class="location-select"
                  clearable
                >
                  <el-option
                    v-for="city in cityList"
                    :key="city.shijXzqhDm"
                    :label="city.shijXzqhMc"
                    :value="city.shijXzqhDm"
                  />
                </el-select>
                <el-select
                  v-model="from.xjDm"
                  @change="handleCountyChange"
                  class="location-select"
                  clearable
                >
                  <el-option
                    v-for="county in countyList"
                    :key="county.xjXzqhDm"
                    :label="county.xjXzqhMc"
                    :value="county.xjXzqhDm"
                  />
                </el-select>
              </el-form-item>
              <el-form-item
                label="详细地址："
                label-width="40%"
                prop="orgAdress"
                class="address-form-item"
              >
                <el-input
                  v-model="from.orgAdress"
                  autocomplete="off"
                  style="width: 200%"
                  class="full-width-input"
                ></el-input>
              </el-form-item>
            </div>

            <div class="form-col">
              <el-form-item label="是否集团：" label-width="40%">
                <el-select
                  v-model="from.isGroup"
                  placeholder=""
                  style="width: 70%"
                >
                  <el-option label="是" value="Y" />
                  <el-option label="否" value="N" />
                </el-select>
              </el-form-item>
              <el-form-item label="所属法人机构：" label-width="40%">
                <el-input
                  v-model="from.corpOrg"
                  autocomplete="off"
                  style="width: 70%"
                ></el-input>
              </el-form-item>
              <el-form-item label="所属集团：" label-width="40%">
                <el-input
                  v-model="from.orgStatus"
                  autocomplete="off"
                  style="width: 70%"
                ></el-input>
              </el-form-item>
              <el-form-item label="机构排序号：" label-width="40%">
                <el-input
                  v-model="from.sortNo"
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
        <el-form :model="sysAdOrg">
          <el-form-item label="机构名称：" label-width="25%">
            <el-input
              v-model="sysAdOrg.orgName"
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

<style>
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

.lb-div {
  margin-top: 10px;
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
  flex: 0 0 25%;
  padding: 0 10px;
  box-sizing: border-box;
}

.location-select {
  width: 70%;
}
</style>

<script>
import request from "@/utils/request";

export default {
  computed: {
    uploadUrl() {
      return `${process.env.VUE_APP_API_BASE_URL}/sysAdOrg/importExcel`;
    },
  },

  data() {
    return {
      sysAdOrg: {
        orgName: "",
        // userPhone: '',
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
      orgUuidIn: [],
      dataBean: {},
      token: JSON.parse(localStorage.getItem("user")).token,
      orgMap: [],
      roleMap: [],
      provinceList: [], // 省级列表
      cityList: [], // 市级列表
      countyList: [], // 县级列表
      rules: {
        orgCode: [
          { required: true, message: "请输入机构代码", trigger: "blur" },
        ],
        orgName: [
          { required: true, message: "请输入机构名称", trigger: "blur" },
        ],
        userPassword: [
          { required: true, message: "请输入用户密码", trigger: "blur" },
        ],

        userAge: [{ validator: this.validateAge, trigger: "blur" }],
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
      this.selectListByBean();
      this.selectXzqhList();
    },

    queryData() {
      this.queryDialogFromFlag = true;
    },

    queryPageList() {
      request.post("sysAdOrg/queryPageList", this.sysAdOrg).then((res) => {
        if (res.code === 201) {
          this.tableData = res.data.list;
          this.total = res.data.total;
          this.sysUser = {
            orgName: "",
            // userPhone: '',
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
      this.sysAdOrg = {
        userName: "",
        userPhone: "",
        pageNum: 1,
        pageSize: 20,
      };
      this.queryPageList();
    },

    handleSizeChange(pageSize) {
      this.sysAdOrg.pageSize = pageSize;
      this.queryPageList();
    },

    handleCurrentChange(pageNum) {
      this.sysAdOrg.pageNum = pageNum;
      this.queryPageList();
    },

    // 自定义年龄校验
    validateAge(rule, value, callback) {
      if (value !== null || value !== "") {
        let num = Number(value);
        console.log(num);
        if (!Number.isInteger(num)) {
          callback(new Error("年龄必须为整数"));
        } else if (value < 0) {
          callback(new Error("年龄不能为负数"));
        } else if (value > 150) {
          callback(new Error("年龄不能超过150岁"));
        } else {
          callback();
        }
      }
    },

    save() {
      this.saveOrUpdateTitle = "新增";
      this.from = {};
      this.dialogFormVisible = true;
      this.saveOrUpdateFlag = "sysAdOrg/save";
    },

    update() {
      //省市区回显
      this.getCityAndCountyList(this.dataBean.sjDm, this.dataBean.shijDm);

      if (this.orgUuidIn.length === 0) {
        this.$message.warning("请勾选您要修改的项！");
        return;
      }
      if (this.orgUuidIn.length > 1) {
        this.$message.warning("只能选择一条数据修改！");
        return;
      }

      this.saveOrUpdateTitle = "修改";
      this.from = JSON.parse(JSON.stringify(this.dataBean)); // 用副本进行编辑
      this.originalData = JSON.parse(JSON.stringify(this.dataBean)); // 深拷贝原始数据
      this.dialogFormVisible = true;
      this.saveOrUpdateFlag = "sysAdOrg/update";
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
              this.orgUuidIn = [];
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

    deleteData(data) {
      if (this.orgUuidIn.length === 0) {
        this.$message.warning("请勾选您要删除的项！");
        return;
      }

      data = {
        orgUuidIn: this.orgUuidIn,
      };
      request.post("sysAdOrg/delete", data).then((res) => {
        if (res.code === 201) {
          this.$message({
            message: res.message,
            type: "success",
          });
          this.dialogFormVisible = false;
          this.orgUuidIn = [];
          this.reset();
        } else {
          this.$message.error(res.message);
        }
      });
      this.reset();
    },

    excelData(excelData) {
      excelData = {
        orgName: this.sysAdOrg.orgName,
        // userPhone: this.sysUser.userPhone,
        orgUuidIn: this.orgUuidIn,
      };

      request.post("/sysAdOrg/exportExcel", excelData, {
        responseType: "blob",
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
      this.orgUuidIn = [];
      // 遍历并收集UUID
      val.forEach((item) => {
        if (item.orgUuid) {
          this.orgUuidIn.push(item.orgUuid);
          this.dataBean = item;
        }
      });
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

    selectXzqhList() {
      request.post("dmSjXzqh/selectXzqhList", this.from).then((res) => {
        if (res.code === 201) {
          this.provinceList = res.data;
        } else {
          this.$message.error(res.message);
        }
      });
    },

    // 省级选择变化
    handleProvinceChange(provinceCode) {
      // 清空下级选择
      this.from.shijDm = "";
      this.from.xjDm = "";
      this.cityList = [];
      this.countyList = [];

      if (!provinceCode) return;
      this.getCityAndCountyList(provinceCode, null);
    },

    // 市级选择变化
    handleCityChange(cityCode) {
      // 清空区县选择
      this.from.xjDm = "";
      this.countyList = [];

      if (!cityCode) return;
      this.getCityAndCountyList(null, cityCode);
    },

    // 添加区县选择变化监听
    handleCountyChange(countyCode) {
      // 强制更新视图
      this.$forceUpdate();
    },

    getCityAndCountyList(provinceCode, cityCode) {
      if (provinceCode) {
        // 查找选中的省份
        const selectedProvince = this.provinceList.find(
          (province) => province.sjXzqhDm === provinceCode
        );

        if (selectedProvince && selectedProvince.dmShijXzqhList) {
          this.cityList = selectedProvince.dmShijXzqhList;
        }
      }

      if (cityCode) {
        // 查找选中的城市
        const selectedCity = this.cityList.find(
          (city) => city.shijXzqhDm === cityCode
        );

        if (selectedCity && selectedCity.dmXjXzqhList) {
          this.countyList = selectedCity.dmXjXzqhList;
        }
      }
    },
  },
};
</script>
