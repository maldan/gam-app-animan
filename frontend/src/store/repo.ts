import { ActionContext } from 'vuex';
import { MainTree } from '.';
import Axios from 'axios';
import { AM_IObjectInfo } from '@/core/am/AM_Object';

/*export type RepoObject = {
  name: string;
  category: string;
  previewPath: string;
  modelPath: string;
};*/

export type RepoStore = {
  objectList: AM_IObjectInfo[];
};
export type RepoActionContext = ActionContext<RepoStore, MainTree>;

export default {
  namespaced: true,
  state: {
    objectList: [],
  },
  mutations: {
    SET_OBJECT_LIST(state: RepoStore, list: AM_IObjectInfo[]): void {
      state.objectList = list;
    },
  },
  actions: {
    async getList(action: RepoActionContext, category: string): Promise<void> {
      // Get list
      let list = (
        await Axios.get(`${action.rootState.main.API_URL}/repo/list?category=${category}`)
      ).data.response as AM_IObjectInfo[];

      list = list.map((x) => {
        x.modelPath = `${action.rootState.main.ROOT_URL}/` + x.modelPath;
        if (x.previewPath) x.previewPath = `${action.rootState.main.ROOT_URL}/` + x.previewPath;
        return x;
      });
      action.commit('SET_OBJECT_LIST', list);
    },
    async uploadPreview(
      action: RepoActionContext,
      payload: { name: string; category: string; image: string },
    ): Promise<void> {
      const f = await fetch(payload.image);
      const b = await f.blob();

      const formData = new FormData();
      formData.set('name', payload.name);
      formData.set('category', payload.category);
      formData.append('preview', new File([b], 'File name', { type: 'image/jpeg' }), 'preview.jpg');

      await Axios.put(`${action.rootState.main.API_URL}/repo/preview`, formData);
    },
  },
};
