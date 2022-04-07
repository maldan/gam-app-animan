import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import Animation from '../page/Animation.vue';
import Clip from '../page/Clip.vue';
import Repo from '../page/Repo.vue';
import Audio from '../page/Audio.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/animation',
    name: 'Animation',
    component: Animation,
  },
  {
    path: '/clip',
    name: 'Clip',
    component: Clip,
  },
  {
    path: '/repo',
    name: 'Repo',
    component: Repo,
  },
  {
    path: '/audio',
    name: 'Audio',
    component: Audio,
  },
];

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes,
});

export default router;
