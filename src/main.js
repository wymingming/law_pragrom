// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import VueResource from "vue-resource"
import router from './router'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import VueVideoPlayer from 'vue-video-player'
import 'video.js/dist/video-js.css'
import 'vue-video-player/src/custom-theme.css'
import 'videojs-flash'
import 'videojs-contrib-hls/dist/videojs-contrib-hls'
//import store from './store'

Vue.config.productionTip = false
//Vue.use(VueRouter)
Vue.use(VueVideoPlayer)
Vue.use(VueResource)
Vue.use(ElementUI)

/* eslint-disable no-new */
new Vue({
	el: '#app',
	//store,
  	router,
	components: {
		App
	},
	template: '<App/>'
})
