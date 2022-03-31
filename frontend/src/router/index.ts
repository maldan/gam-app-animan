import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import CharacterAnimation from '../page/CharacterAnimation.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/character-animation',
    name: 'Character Animation',
    component: CharacterAnimation,
  },
];

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes,
});

export default router;
