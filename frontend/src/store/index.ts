import { createStore } from 'vuex';

import modal, { ModalStore } from '../gam_sdk_ui/vue/store/modal';
import main, { MainStore } from './main';
import scene, { SceneStore } from './scene';
import repo, { RepoStore } from './repo';

export type MainTree = {
  main: MainStore;
  modal: ModalStore;
  scene: SceneStore;
  repo: RepoStore;
};

export default createStore({
  modules: { main, modal, scene, repo },
});
