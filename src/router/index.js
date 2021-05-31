import { createRouter, createWebHistory } from 'vue-router'
import Canvas from '../views/Canvas.vue'

const routes = [
  {
    path: '/',
    name: 'Canvas',
    component: Canvas
  },
  {
    path: '/about',
    name: 'About',
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
