<template>
  <el-card class="box-card">
    <template #header>
      <div class="clearfix">
        <span>青龙第往期期福利中奖列表</span>
        <el-button
          style="float: right; padding: 3px 0"
          type="text"
          @click="goToCjLb()"
          >>></el-button
        >
      </div>
    </template>

    <div class="div2">
      <button @click="lotteryDraw()">
        <p>抽奖</p>
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
          height: '20px',
          padding: '0px',
          'border-color': '#333333',
        }"
        :cell-style="{
          'text-align': 'center',
          color: '#333333',
          height: '20px',
          padding: '0px',
          'border-color': '#333333',
        }"
        style="width: 100%; border-color: #333333"
        border
      >
        <el-table-column prop="hjBh" label="获奖名次" />
        <el-table-column prop="jpMc" label="获奖奖项" />
      </el-table>
    </div>

    <div class="div3">
      <span class="span3">
        抽奖规则 <br />
        <span class="span2"
          >打完全程有机会获得抽奖名额，中奖人员请联系青龙管理层兑奖。 <br
        /></span>
        <span class="span3">最终解释权归青龙管理层所有。 <br /></span>
      </span>
    </div>

    <div>
      <el-dialog
        title="抽奖"
        v-model="cjDialogFormVisible"
        width="30%"
        :close-on-click-modal="false"
      >
        <el-form :model="from" :rules="rules" ref="formRef">
          <el-form-item label="抽奖类型：" label-width="25%" prop="jpDm">
            <el-select v-model="from.jpDm" placeholder="" style="width: 50%">
              <el-option
                v-for="item in dmRsCjlx"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="抽奖名次范围：" label-width="25%" prop="range">
            <el-input
              v-model="from.mcStart"
              type="number"
              autocomplete="off"
              style="width: 24%"
            ></el-input>
            -
            <el-input
              v-model="from.mcEnd"
              type="number"
              autocomplete="off"
              style="width: 24%"
            ></el-input>
          </el-form-item>

          <el-form-item label="奖品数量：" label-width="25%" prop="jpSl">
            <el-input
              v-model="from.jpSl"
              type="number"
              autocomplete="off"
              style="width: 50%"
            ></el-input>
          </el-form-item>

          <el-form-item label="获奖日期：" label-width="25%">
            <el-date-picker
              v-model="from.hjRq"
              type="date"
              placeholder="选择日期"
              style="width: 50%"
            ></el-date-picker>
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="cjDialogFormVisible = false">取消</el-button>
            <el-button type="primary" @click="submit()">确定</el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </el-card>
</template>

<script>
import request from "@/utils/request";

export default {
  name: "HomeView",
  data() {
    return {
      tableData: [],
      total: 0,
      cjDialogFormVisible: false,
      from: {},
      originalData: {},
      dmRsCjlx: [],
      dataBean: {},
      orgMap: [],
      rules: {
        jpDm: [{ required: true, message: " ", trigger: "blur" }],
        range: [{ validator: this.validateRange, trigger: "blur" }],
        jpSl: [{ validator: this.validateJpSl, trigger: "blur" }],
      },
    };
  },

  created() {
    this.load();
  },

  methods: {
    load: function () {
      this.selectOrgCode2OrgNameMap();
      this.queryCodeMapList();
      this.selectCjList();
    },

    goToCjLb() {
      this.$router.push("/rsZjjl");
    },

    lotteryDraw() {
      this.cjDialogFormVisible = true;
      this.from = {};
    },

    validateRange(rule, value, callback) {
      if (!this.from.mcStart && this.from.mcStart !== 0) {
        callback(new Error("请输入开始名次"));
      } else if (!this.from.mcEnd && this.from.mcEnd !== 0) {
        callback(new Error("请输入结束名次"));
      } else if (Number(this.from.mcStart) > Number(this.from.mcEnd)) {
        callback(new Error("开始名次不能大于结束名次"));
      } else {
        callback();
      }
    },

    validateJpSl(rule, value, callback) {
      if (value !== null || value !== "") {
        let num = Number(value);
        if (!Number.isInteger(num)) {
          callback(new Error("奖品数量必须为整数"));
        } else if (value < 0) {
          callback(new Error("奖品数量不能为负数"));
        } else if (value > 20) {
          callback(new Error("奖品数量不能超过20个"));
        } else {
          callback();
        }
      }
    },

    submit() {
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          request.post("rsZjjl/save", this.from).then((res) => {
            if (res.code === 201) {
              this.$message({
                message: res.message,
                type: "success",
              });
              this.cjDialogFormVisible = false;
              this.selectCjList();
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

    selectCjList() {
      request.post("rsZjjl/selectCjList", this.dataBean).then((res) => {
        if (res.code === 201) {
          this.tableData = res.data;
        } else {
          this.$message.error(res.message);
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

    queryCodeMapList(data) {
      data = {
        codeTypeIn: ["DM_RS_CJLX"],
      };
      request.post("ggCodeTab/queryCodeMapList", data).then((res) => {
        if (res.code === 201) {
          this.dmRsCjlx = this.transformOrgData(res.data.DM_RS_CJLX);
        } else {
          this.$message.error(res.message);
        }
      });
    },
  },
};
</script>

<style scoped>
.box-card {
  width: 50%;
  height: 500px;
  position: relative;
}

.div2 button {
  background-color: red;
  line-height: 0;
  cursor: pointer;
  color: #333333;
}

.span2 {
  font-size: 15px;
  color: #545c64;
}

.span3 {
  font-size: 20px;
  color: crimson;
}

.div3 {
  position: absolute;
  bottom: 0;
  background: white;
  z-index: 10;
}
</style>
