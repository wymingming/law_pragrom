import Vue from 'vue'
import Router from 'vue-router'
import labelProgram from '@/components/labelProgram'
import login from '@/components/login'
import HelloWorld from '@/components/HelloWorld'
import init from '@/components/init'
import playlist from '@/components/playlist'
import mainpage from '@/components/mainpage'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/login',
      name: 'login',
      component: login,
    },
    {
      path: '/labelProgram',
      name: 'labelProgram',
      component: labelProgram
    },
    {
      path: '/init',
      name: 'init',
      component: init
    },
    {
      path: '/playlist',
      name: 'playlist',
      component: playlist,
    },
    {
      path: '/mainpage',
      name: 'mainpage',
      component: mainpage
    },
    {
      path: '/HelloWorld',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {
      path: '*',
      component: login,
    }
  ]
})
