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


	<el-tabs type="border-card" v-model="activeName" @tab-click="handleClick">
		<el-tab-pane label="未标注视频" name="Untagged">
			<div class="box">
			      <div >
							<!-- 这里写列表 -->
							
							<el-table
								:data="Untaggedurls"
								style="width: 100%">
								
								<el-table-column
									prop="name"
									label="视频列表"
									width="180px">
									<template slot-scope="scope">
										<el-button
											size="mini"
											type="text"
											@click="handleEdit(scope.$index,scope.row)">{{scope.row.name}}</el-button>
											
									</template>
									
										

								</el-table-column>
								
								
							</el-table>
							<el-pagination
								@current-change="UnTaggedhandleCurrentChange"
								small
								layout="prev, pager, next"
								:total="UnTaggedtotal"
								:page-size="6">
							</el-pagination>
							</div>
								<div  class="player item">
									<img v-if="isshow" id="untaggedblankpng" src="../../static/images/blank.png"/>
									<video-player v-else id="untaggedvideo"
																class="vjs-custom-skin"
																ref="videoPlayer"
																:options="playerOptions"
																:playsinline="true"
																@pause="onPlayerPause($event)"
																@timeupdate="onTimeupdate($event)"
																>
									</video-player>
									<div style="width: 320px;">
										
									</div>
								</div>
			
			
							</div>
							
			       
						<div v-if="!isshow">
							<el-button @click="strat" round size="mini">违规行为开始</el-button>
							<el-button @click="stop" round size="mini">违规行为结束</el-button>
							<el-card class="box-card">
								<el-tag
									v-for="(stime,index) in starttime"
									:key="stime,index"
									closable
									@close="handleClose(index)">
									{{stime}} ---- {{endtime[index]}} 
								</el-tag>
								<!-- <div class="lt" >
								
									<p v-for="(stime,index) in starttime" :key="stime,index"> {{index+1}}.  {{stime}}----</p>
								</div>
								<div class="lt">
									<p v-for="(etime,index) in endtime" :key="index,etime">{{etime}}
									<el-button  @click="del(index)" type="danger" icon="el-icon-delete" circle size="mini" ></el-button>
									</p>
								</div> -->
								<div class="sub">
									<el-button @click="submit()" round size="mini">提交</el-button>
								</div>
							</el-card>
								<!-- <div>
									<div class="lt" >
									
										<p v-for="(stime,index) in starttime" :key="stime,index"> {{index+1}}.  {{stime}}----</p>
									</div>
									<div class="lt">
										<p v-for="(etime,index) in endtime" :key="index,etime">{{etime}}<button  @click="del(index)">删除</button></p>
									</div>
									<div class="sub">
										<button @click="submit()">提交</button>
									</div>
								</div> -->
						</div>
			</div>
		</el-tab-pane>
		
		<el-tab-pane label="已标注视频" name="Tagged">
		
		
		</el-tab-pane>
		
		<el-tab-pane label="所有视频" name="All">
				<div class="box">
							      <div >
											<!-- 这里写列表 -->
											<el-table
												:data="Allurls"
												style="width: 100%">
												<el-table-column
													prop="name"
													label="视频列表"
													width="180px">
													<template slot-scope="scope">
														<el-button
															size="mini"
															type="text"
															@click="handleEdit(scope.$index,scope.row)">{{scope.row.name}}</el-button>
													</template>
												</el-table-column>
											</el-table>
											<el-pagination
												@current-change="AllhandleCurrentChange"
												small
												layout="prev, pager, next"
												:total="Alltotal"
												:page-size="6">
											</el-pagination>
											<!-- <div  class="item_list">
												<div
													@click="chooseVideo(video)"
													v-for="video in Allurls"
													:key="video.id"
													>
													<span>{{video.name}}</span>
													
												</div> -->
				
												</div>
												<img v-if="isshow" id="untaggedblankpng" src="../../static/images/blank.png"/>
												<div v-else class="player item">
													<video-player  class="vjs-custom-skin"
																				ref="videoPlayer"
																				:options="playerOptions"
																				:playsinline="true"
																				@pause="onPlayerPause($event)"
																				@timeupdate="onTimeupdate($event)">
													</video-player>
												</div>
							
							
											</div>
											
							</div>
		</el-tab-pane>
	</el-tabs>

      </el-main>
</el-container>
	
</template>

<script>

export default {
  name: 'init',
  data () {
    return {
			isshow:true,
		  starttime:[],
			endtime:[],
			//UnTaggedpages:'',
			UnTaggedtotal:'',
			//Taggedpages:'',
			Taggedtotal:'',
			//Allpages:'',
			Alltotal:'',
			nowtime:'',
			Untaggedurls: [],
			Allurls: [],
			Taggedurls: [],
			activeName: 'All',
			video: '',
			playerOptions: {
				autoplay: false,
				controls: true,
				sources: [{
					type: "video/mp4",
					src: ""
				}],
			}
			}
			
	},
	computed: {
      player() {
        return this.$refs.videoPlayer.player
      }
			
  },
	mounted(){
		let url = [];
		
		this.$http.get('http://192.168.1.120:9090/annotation/video/find?currentPage=1&pageSize=6').then((response) => {
			url = response.body.result.records;
			
			this.Allurls = url;
			//this.Allpages = response.body.result.pages;
			this.Alltotal = response.body.result.total;
			//console.log(url);
		},(response) => {
            this.$message.error("list error!");
			//alert("获得视频列表失败");
		});
		//得到标记的数据
		// this.$http.get('http://192.168.1.120:9090/annotation/video/find?currentPage=1&pageSize=6').then((response) => {
		// 	url = response.body.videos;
		// 	this.Taggedurls = url;
		// 	//this.Taggedpages = response.body.result.pages;
		// 	this.Taggedtotal = response.body.result.total;
		// 	//console.log(url);
		// },(response) => {
		// 	alert("获得视频列表失败");
		// });
		
		//得到所有的视频数据
		
		
		
		//console.log(this.urls);
	},
	
// 	mounted(){
// 		const self = this;
// 		this.getAllVideo();
// 
// 	},
	methods: {
// 		handleSizeChange(val) {
//       console.log(`每页 ${val} 条`);
//     },
		AllhandleCurrentChange(val){
			let url = [];
			this.$http.get(`http://192.168.1.120:9090/annotation/video/find?currentPage=${val}&pageSize=6`).then((response) => {
				url = response.body.result.records;
				
				this.Allurls = url;
				//console.log(url);
			},(response) => {
                this.$message.error("list error!");
				//alert("获得视频列表失败");//分页
			});
		},
    UnTaggedhandleCurrentChange(val) {
			let url = [];
			this.$http.get(`http://192.168.1.120:9090/annotation/video/find?currentPage=${val}&pageSize=6`).then((response) => {
				url = response.body.result.records;
				
				this.Untaggedurls = url;
				//console.log(url);
			},(response) => {
                this.$message.error("list error!");
				//alert("获得视频列表失败");
			});
      //console.log(`http://192.168.1.120:9090/annotation/video/find?currentPage=${val}&pageSize=6`);
    },
		handleEdit(index,row){
			//console.log(index,row);
			this.isshow = false;
			if(this.starttime.length==0||confirm("忘记提交了，之前提交的区间会被清空，您确定吗？")){
				this.starttime=[];
				this.endtime=[];
				this.video = row;
				this.playerOptions.sources=[{type:"video/mp4",src:"http://"+row.address}];		 
			}
		},
		handleClose(index){
			this.starttime.splice(index,1);
			this.endtime.splice(index,1);
		},
		// record current time
		onTimeupdate(e) {
			this.$refs.time_A = e.cache_.currentTime;
			
			//console.log('currentTime', e.cache_.currentTime);
		},
		strat(){
			//console.log(this.nowtime);
			//console.log(this.$refs.videoPlayer.player.currentTime().toFixed(2));
			this.starttime.push(this.nowtime);
			
			//console.log(timea);
		},
	  stop(){
			//this.$refs.timeb = this.$refs.videoPlayer.player.currentTime();
			//console.log(this.$refs.videoPlayer.player.currentTime());
			// this.
			//this.timezone.endTime = this.$refs.videoPlayer.player.currentTime();
			//this.endtime.push(this.$refs.videoPlayer.player.currentTime().toFixed(2));
			this.endtime.push(this.nowtime);
			
				
				
		},
		del(index){
			this.starttime.splice(index,1);
			this.endtime.splice(index,1);
		},
		submit(){
			let clipsInfo=[];
			let starttime = this.starttime;
			let endtime = this.endtime;
			for(let i=0;i< starttime.length;i++){
				let timezone = {
					end: 0,
					start: 0
				};
				timezone.start = starttime[i];
				timezone.end = endtime[i];
				clipsInfo.push(timezone);
			}
			//console.log(clipsInfo);
			let json = {id:this.video.id,tagger:1};
			json.clipsInfo=clipsInfo;
			let x = JSON.stringify(json);
			console.log(JSON.stringify(json));
			/**
			"clipsInfo": [
			{
				"end": 0,
				"start": 0
			}
			],
			"id": 0,
			"tagger": 0
			
			  
			 */
			
			return new Promise((resolve, reject) => {
			this.$http.post(
				'http://192.168.1.120:9090/annotation/video/segment',
				x,
				{headers:{'Content-Type':'application/json'}},
				{emulateJSON: true}
			)
			.then((res) => {    //成功胡回调
				//resolve(res.body);
				
				
			//
				console.log(res);
			})
			.catch((res) => {   //失败的回掉
				reject(res.body);
				alert("提交区间失败");
			});
		});

		},
		onPlayerPause(player) {
       //console.log('player pause!', player.currentTime());
			 this.nowtime = player.currentTime().toFixed(2);
			 console.log('player pause!', player.currentTime().toFixed(2));
			 //console.log(this.starttime);
    },
		chooseVideo(video){
			 this.isshow = false;
			
			
			
			
			if(this.starttime.length==0||confirm("忘记提交了，之前提交的区间会被清空，您确定吗？")){
				 this.starttime=[];
				 this.endtime=[];
				 this.video = video;
				 this.playerOptions.sources=[{type:"video/mp4",src:"http://"+video.address}];		 
			}
				
				
			
			
			
		},
		handleClick(tab, event) {
			if(tag.name =="Untagged"){
					this.$http.get('http://192.168.1.120:9090/annotation/video/find?currentPage=1&pageSize=6').then((response) => {
				url = response.body.result.records;
				this.Untaggedurls = url;
				//this.UnTaggedpages = response.body.result.pages;
				this.UnTaggedtotal = response.body.result.total;
				//console.log(url);
			},(response) => {
				alert("获得视频列表失败");
			});
		}
		else if(tag.name =="All"){
			this.$http.get('http://192.168.1.120:9090/annotation/video/find?currentPage=1&pageSize=6').then((response) => {
			url = response.body.result.records;
			
			this.Allurls = url;
			//this.Allpages = response.body.result.pages;
			this.Alltotal = response.body.result.total;
			//console.log(url);
		},(response) => {
			alert("获得视频列表失败");
		});
		}
			console.log(tab.name);
		}
	}
	
}
  

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.playbackView {
  position: relative;
}

.optionsWrapper {
  width: 500px;
  margin: 20px auto;
}
.lt {
	float:left;
	line-height: 3;
}

.xjb{
	display:inline
}
.sub{
	float:right;
}
.box{
	display: -webkit-flex; /* Safari */
  display: flex;
	flex-direction: row;
}
.item{
	width: 800px;/* 视频宽度 */
}
.item_list{
	width: 200px;
	order:-1;
	flex:none;
}

.el-header {
  /* background-color: #B3C0D1; */
  background-color: #409EFF;
  color: #333;
  line-height: 40px;
}
</style>