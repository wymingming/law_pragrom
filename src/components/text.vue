<template>
    <el-col :span="6">
      <el-menu class="el-menu-vertical-demo">
        <el-menu-item index="1-1" @click.native="select">选项1</el-menu-item>
      </el-menu>
    </el-col>
</template>
<script>
export default {
  data() {
    return {};
  },
  methods: {
      select:function(a, b){
          console.info(a, b);
      }
  }
};
</script>
<style>
</style>