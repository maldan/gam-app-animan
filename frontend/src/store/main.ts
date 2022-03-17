import { ActionContext } from 'vuex';
import { MainTree } from '.';

export type MainStore = {
  API_URL: string;
};
export type MainActionContext = ActionContext<MainStore, MainTree>;

export default {
  namespaced: true,
  state: {
    API_URL: process.env.VUE_APP_API_URL || `${window.location.origin}/api`,
  },
  mutations: {},
  actions: {},
};
