<template>
	
		
	
</template>
<script>
	export default {
		name:'playlist',
		data(){
			return{
				urls: [],
				activeName: 'All',
				video: ''
			}
		},
		mounted(){
			let url = [];
			this.$http.get('http://192.168.1.120:9090/annotation/video/getUntagged').then((response) => {
				url = response.body.videos;
				this.urls = url;
				//console.log(url);
			},(response) => {
				alert("获得视频列表失败");
			});
			
		},
		methods: {
			chooseVideo(video){
				
			},
			handleClick(tab, event) {
				console.log(tab.name);
			}
		},
		
	}
</script>
<style scoped>
  .text {
    font-size: 14px;
  }

  .item {
    margin-bottom: 18px;
  }

  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }
  .clearfix:after {
    clear: both
  }

  .box-card {
    width: 480px;
  }
<style>