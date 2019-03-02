<template>
  <div>
    <div class="outer_label">
      <img class="inner_label login_logo" src="../assets/scu.jpg">
    </div>
    <div class="login_form">
      <el-row>
        <el-col>
          <input type="text" class="qxs-ic_user qxs-icon" placeholder="用户名" v-model="userName">
        </el-col>
      </el-row>
      <el-row>
        <el-col>
          <input type="text" class="qxs-ic_password qxs-icon" placeholder="密码" v-model="password">
        </el-col>
      </el-row>
      <el-row>
        <el-col>
          <el-button
            class="login_btn"
            @click.native="login"
            type="primary"
            round
            :loading="isBtnLoading"
          >登录</el-button>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="2" :offset="14">
          <div style="margin-top: 10px">
            <span style="float: right;color: #A9A9AB" @click="forgetPassword">忘记密码</span>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
<script>
import router from "../router";
export default {
  data() {
    return {
      userName: "",
      password: "",
      isBtnLoading: false
    };
  },
  created() {
    if (
      JSON.parse(localStorage.getItem("user")) &&
      JSON.parse(localStorage.getItem("user")).userName
    ) {
      this.userName = JSON.parse(localStorage.getItem("user")).userName;
      this.password = JSON.parse(localStorage.getItem("user")).password;
    }
  },
  computed: {
    btnText() {
      if (this.isBtnLoading) return "登录中...";
      return "登录";
    }
  },
  methods: {
    login() {
      if (!this.userName) {
        this.$message.error("请输入用户名");
        return;
      }
      if (!this.password) {
        this.$message.error("请输入密码");
        return;
      }
      router.push("/labelProgram");
    //   this.$http
    //     .get("http://192.168.1.120:9090/", {
    //       headers: { "Content-Type": "application/json" },
    //       params: { account: this.userName, password: this.password }
    //     })
    //     .then(res => {
    //       if (res) ;
    //     })
    //     .catch(function(data) {
    //       alert("login failed");
    //     });
    },
    forgetPassword() {}
  }
};
</script>
<style>
.outer_label {
  position: relative;
  left: 0;
  top: 0;
  width: 100%;
  height: 220px;
  text-align: center;
  filter: brightness(1.4);
}
.inner_label {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  margin: auto;
  height: 50px;
}
.qxs-icon {
  height: 40px;
  width: 90%;
  margin-bottom: 5px;
  padding-left: 10%;
  border: 0;
  border-bottom: solid 1px lavender;
}
.login_form {
  padding-top: 5%;
  padding-left: 10%;
  padding-right: 10%;
  text-align: center;
}
.qxs-ic_user {
  background: url("../assets/account.jpg") no-repeat;
  background-size: 13px 15px;
  background-position: 3%;
  width: 320px;
}
.qxs-ic_password {
  background: url("../assets/password.jpg") no-repeat;
  background-size: 13px 15px;
  background-position: 3%;
  margin-bottom: 20px;
  width: 320px;
}
.login_logo {
  height: 100%;
}
.login_btn {
  width: 400px;
  font-size: 18px;
  background: -webkit-linear-gradient(left, #0ea6e2); /* Safari 5.1 - 6.0 */
  background: -o-linear-gradient(right, #0ea6e2); /* Opera 11.1 - 12.0 */
  background: -moz-linear-gradient(right, #0ea6e2); /* Firefox 3.6 - 15 */
  background: linear-gradient(to right, #0ea6e2); /* 标准的语法 */
  filter: brightness(1.4);
}
</style>