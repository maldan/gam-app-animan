import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import AnimationEditor from '../page/animation/Editor.vue';
import AnimationList from '../page/animation/List.vue';
import ClipEditor from '../page/clip/Editor.vue';
import ClipList from '../page/clip/List.vue';
import ObjectList from '../page/object/List.vue';
import ObjectPreview from '../page/object/Preview.vue';
import PoseEditor from '../page/pose/Editor.vue';
import PoseList from '../page/pose/List.vue';

import Audio from '../page/Audio.vue';
import VRPreview from '../page/VRPreview.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/animation',
    name: 'Animation List',
    component: AnimationList,
  },
  {
    path: '/animation/:resourceId',
    name: 'Animation Editor',
    component: AnimationEditor,
  },

  {
    path: '/pose',
    name: 'Pose List',
    component: PoseList,
  },
  {
    path: '/pose/:resourceId',
    name: 'Pose Editor',
    component: PoseEditor,
  },

  {
    path: '/clip',
    name: 'Clip List',
    component: ClipList,
  },
  {
    path: '/clip/:resourceId',
    name: 'Clip Editor',
    component: ClipEditor,
  },

  {
    path: '/object',
    name: 'Object List',
    component: ObjectList,
  },
  {
    path: '/object/:resourceId',
    name: 'Object Preview',
    component: ObjectPreview,
  },

  {
    path: '/audio',
    name: 'Audio',
    component: Audio,
  },
  {
    path: '/vr',
    name: 'VR Preview',
    component: VRPreview,
  },
];

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes,
});

export default router;
