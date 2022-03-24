import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import Main from '../page/Main.vue';
import Repo from '../page/Repo.vue';
import Preview from '../page/Preview.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Main',
    component: Main,
  },
  {
    path: '/repo',
    name: 'Repo',
    component: Repo,
  },
  {
    path: '/preview/:category/:name',
    name: 'Preview',
    component: Preview,
  },
];

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes,
});

export default router;
