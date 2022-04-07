import { createStore } from 'vuex';

import modal, { ModalStore } from '../gam_sdk_ui/vue/store/modal';
import main, { MainStore } from './main';
import repo, { RepoStore } from './repo';

export type MainTree = {
  main: MainStore;
  modal: ModalStore;
  repo: RepoStore;
};

export default createStore({
  modules: { main, modal, repo },
});
