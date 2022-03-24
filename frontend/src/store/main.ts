import { ActionContext } from 'vuex';
import { MainTree } from '.';

export type MainStore = {
  API_URL: string;
  ROOT_URL: string;
};
export type MainActionContext = ActionContext<MainStore, MainTree>;

export default {
  namespaced: true,
  state: {
    API_URL: process.env.VUE_APP_API_URL || `${window.location.origin}/api`,
    ROOT_URL: process.env.VUE_APP_ROOT_URL || `${window.location.origin}`,
  },
  mutations: {},
  actions: {},
};
