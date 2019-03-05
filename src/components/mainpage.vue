<template>
<el-container>
      <el-header style="text-align: right; font-size: 14px;height: 40px">
        <el-dropdown @command="dropdownCommand">
          <i class="el-icon-setting" style="margin-right: 15px"></i>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="logout">注销</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <span>姓名</span>
      </el-header>
      <el-main>
		<h1>主界面</h1>

		<el-table
		:data="urls"
		style="width: 50%">
		
		<el-table-column
		label="原始视频列表"
		width="320">
		<template slot-scope="scope">
			<span style="margin-left: 10px">{{ scope.row.name }}</span>
		</template>
		</el-table-column>
		<el-table-column label="操作">
		<template slot-scope="scope">
			<el-button
			size="mini"
			type="danger"
			@click="handleDelete(scope.$index, scope.row.id)">删除</el-button>
		</template>
		</el-table-column>
		</el-table>
		<el-pagination
			@current-change="handleCurrentChange"
			small
			layout="prev, pager, next"
			:total="total"
			:page-size="10">
		</el-pagination>
		<el-button @click="scan" round size="mini">扫描</el-button>
		<el-button @click="clip" round size="mini">开始切割</el-button>
      </el-main>
</el-container>
</template>
<script>
  export default {
    data() {
      return {
		urls :[],
        total:''
      }
    },
	mounted(){
		let url = [];
		//得到原始的数据
		this.$http.get('http://192.168.1.120:9090/annotation/originVideo/find?currentPage=1').then((response) => {
			url = response.body.result.records;
			this.urls = url;
			//this.UnTaggedpages = response.body.result.pages;
			this.total = response.body.result.total;
			//console.log(url);
		},(response) => {
			alert("获得视频列表失败");
		});
	},
    methods: {
    dropdownCommand: function(command){
      if(command === 'logout'){
        this.$message('logout');
      }
    },
      handleDelete(index,id) {
        //console.log(id);
		this.$http.delete(`http://192.168.1.120:9090/annotation/originVideo/delete?ids=${id}`).then((response) => {
			//console.log(response.message);
			this.urls.splice(index,1);
			//console.log(url);
		},(response) => {
			alert("删除失败");
		});
		
      },
	  handleCurrentChange(val) {
	  	let url = [];
	  	this.$http.get(`http://192.168.1.120:9090/annotation/originVideo/find?currentPage=${val}`).then((response) => {
	  		url = response.body.result.records;
	  		
	  		this.urls = url;
	  		//console.log(url);
	  	},(response) => {
	  		alert("获得视频列表失败");
	  	});
	  	//console.log(`http://192.168.1.120:9090/annotation/video/find?currentPage=${val}&pageSize=6`);
	  },
    }
  }
</script>