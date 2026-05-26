<template>场地预约小程序后台</template>

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

  methods: {
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
