<template>
  <div class="div-class">
    <div class="main-class">
      <div class="text-class">登录</div>
      <div class="from-class">
        <el-form :model="from">
          <div style="margin-bottom: 20px">
            <el-input
              type="text"
              v-model="from.userName"
              prefix-icon="User"
              placeholder="用户名"
            ></el-input>
          </div>
          <div style="margin-bottom: 20px">
            <el-input
              type="password"
              v-model="from.userPassword"
              prefix-icon="Lock"
              placeholder="密码"
            ></el-input>
          </div>
          <el-form-item>
            <el-button type="primary" @click="login()">登录</el-button>
            <el-button @click="register()">注册</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <div id="footer">
      <p>@版权所有 | 开发者小零食</p>
    </div>
  </div>
</template>

<style scoped>
#footer {
  position: absolute;
  width: 100%;
  text-align: center;
  color: white;
  font-size: 14px;
  margin-top: 260px;
}

.div-class {
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url("@/assets/home_login.jpg");
  height: 100vh;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.main-class {
  width: 400px;
  height: 300px;
  border-radius: 10px;
  background-color: hsla(190, 100%, 50%, 0.5);
}

.text-class {
  width: 100%;
  height: 100px;
  font-size: 40px;
  line-height: 100px;
  text-align: center;
  color: black;
}

.from-class {
  text-align: center;
  height: 320px;
  width: 80%;
  margin: 0 auto;
}
</style>

<script>
import request from "@/utils/request";

export default {
  name: "LoginView",
  data() {
    return {
      from: {},
    };
  },

  created() {
    // 页面加载时的初始化逻辑
  },

  methods: {
    login() {
      request
        .post("/sysUser/login", this.from)
        .then((res) => {
          if (res.code === 201) {
            localStorage.setItem("user", JSON.stringify(res.data));
            this.$router.push("/home");
          } else {
            this.$message.error(res.message);
          }
        })
        .catch((error) => {
          this.$message.error(error.message);
        });
    },

    register() {
      // 注册功能待实现
      this.$message.info("注册功能开发中");
    },
  },
};
</script>
