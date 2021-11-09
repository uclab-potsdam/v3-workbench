// import { createRouter, createWebHistory } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'
// import Main from '../views/Main.vue'
import store from '@/store'

const routes = [
  {
    path: '/',
    redirect: { name: 'Open' }
  },
  {
    path: '/signin',
    name: 'Sign in',
    component: () => import(/* webpackChunkName: "about" */ '../views/SignIn.vue')
  },
  {
    path: '/canvas',
    name: 'Open',
    component: () => import(/* webpackChunkName: "about" */ '../views/Canvases.vue')
  },
  {
    path: '/canvas/:id',
    name: 'Canvas',
    component: () => import(/* webpackChunkName: "about" */ '../views/Canvas.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes
})

router.beforeEach(async (to) => {
  // console.log(to.name === 'S', store)
  // const authStatus = store.getters['auth/isAuthenticated']
  if (store.getters['auth/isAuthenticated'] || to.name === 'Sign in') return
  if (!store.getters['auth/hasCredentials']) return { replace: true, name: 'Sign in' }
  const authStatus = await store.dispatch('auth/authenticate', null, { root: true })

  if (authStatus) return
  return { replace: true, name: 'Sign in' }
})

export default router
