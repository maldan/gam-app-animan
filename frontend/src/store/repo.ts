import Axios from 'axios';
import { ActionContext } from 'vuex';
import { MainTree } from '.';
import { IVirtualObject } from '@/Types';

export type RepoStore = {
  objectList: IVirtualObject[];
};
export type RepoActionContext = ActionContext<RepoStore, MainTree>;

export default {
  namespaced: true,
  state: {
    objectList: [],
  },
  mutations: {
    SET_OBJECT_LIST(state: RepoStore, list: IVirtualObject[]): void {
      state.objectList = list;
    },
  },
  actions: {
    getList(action: RepoActionContext): void {},
    async upload(action: RepoActionContext): Promise<void> {
      const formData = new FormData();
      formData.set('name', action.rootState.modal.data.name);
      formData.set('model', action.rootState.modal.data.model[0]);

      await Axios.put(`${action.rootState.main.API_URL}/object`, formData);
    },
  },
};
