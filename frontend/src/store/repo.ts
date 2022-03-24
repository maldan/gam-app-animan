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
    async getList(action: RepoActionContext): Promise<void> {
      let list = (await Axios.get(`${action.rootState.main.API_URL}/object/list`)).data
        .response as IVirtualObject[];
      list = list.map((x) => {
        x.modelPath = `${action.rootState.main.ROOT_URL}/` + x.modelPath;
        if (x.previewPath) x.previewPath = `${action.rootState.main.ROOT_URL}/` + x.previewPath;
        return x;
      });
      action.commit('SET_OBJECT_LIST', list);
    },
    async upload(action: RepoActionContext): Promise<void> {
      const formData = new FormData();
      formData.set('name', action.rootState.modal.data.name);
      formData.set('model', action.rootState.modal.data.model[0]);

      await Axios.put(`${action.rootState.main.API_URL}/object`, formData);
    },
    async uploadPreview(
      action: RepoActionContext,
      payload: { name: string; image: string },
    ): Promise<void> {
      const f = await fetch(payload.image);
      const b = await f.blob();

      const formData = new FormData();
      formData.set('name', payload.name);
      formData.append('preview', new File([b], 'File name', { type: 'image/jpeg' }), 'preview.jpg');

      await Axios.put(`${action.rootState.main.API_URL}/object/preview`, formData);
    },
  },
};
