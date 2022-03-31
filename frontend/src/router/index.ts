import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import Animation from '../page/Animation.vue';
import CharacterAnimation from '../page/CharacterAnimation.vue';
import Clip from '../page/Clip.vue';
import Repo from '../page/Repo.vue';
import Preview from '../page/Preview.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Animation',
    component: Animation,
  },
  {
    path: '/character-animation',
    name: 'Character Animation',
    component: CharacterAnimation,
  },
  {
    path: '/repo',
    name: 'Repo',
    component: Repo,
  },
  {
    path: '/clip',
    name: 'Clip',
    component: Clip,
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
