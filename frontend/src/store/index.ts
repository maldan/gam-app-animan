import { createStore } from 'vuex';

import modal, { ModalStore } from '../gam_sdk_ui/vue/store/modal';
import main, { MainStore } from './main';

export type MainTree = {
  main: MainStore;
  modal: ModalStore;
};

export default createStore({
  modules: { main, modal },
});
