import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import Animation from '../page/Animation.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/animation',
    name: 'Animation',
    component: Animation,
  },
];

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes,
});

export default router;
