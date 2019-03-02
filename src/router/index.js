import Vue from 'vue'
import Router from 'vue-router'
import labelProgram from '@/components/labelProgram'
import login from '@/components/login'
import vedioProgram from '@/components/vedioProgram'
import originVedio from '@/components/originVedio'
import text from '@/components/text'

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
      path: '/vedioProgram',
      name: 'vedioProgram',
      component: vedioProgram
    },
    {
      path: '/originVedio',
      name: 'originVedio',
      component: originVedio
    },
    {
      path: '/text',
      name: 'text',
      component: text
    }
    // {
    //   path: '*',
    //   component: login,
    // }

    // {
    //   path: '/',
    //   name: 'login',
    //   component: login,
    //   meta: {
    //     requiredLogin: true
    //   },
    //   children: [
    //     {
    //       path: 'labelProgram',
    //       component: labelProgram
    //     }
    //   ]
    // }
  ]
})
