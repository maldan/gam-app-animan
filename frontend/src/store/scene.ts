import { ActionContext } from 'vuex';
import { MainTree } from '.';
import Axios from 'axios';
import { IVirtualObject } from '@/Types';
import { RepoActionContext } from '@/store/repo';

export type SceneStore = {
  characterList: IVirtualObject[];
};
export type SceneActionContext = ActionContext<SceneStore, MainTree>;

export default {
  namespaced: true,
  state: {
    characterList: [],
  },
  mutations: {
    SET_CHARACTER_LIST(state: SceneStore, list: IVirtualObject[]): void {
      state.characterList = list;
    },
  },
  actions: {
    async getCharacterList(action: RepoActionContext): Promise<void> {
      let list = (
        await Axios.get(`${action.rootState.main.API_URL}/object/list?category=character`)
      ).data.response as IVirtualObject[];

      list = list.map((x) => {
        x.modelPath = `${action.rootState.main.ROOT_URL}/` + x.modelPath;
        if (x.previewPath) x.previewPath = `${action.rootState.main.ROOT_URL}/` + x.previewPath;
        return x;
      });
      action.commit('SET_CHARACTER_LIST', list);
    },
  },
};
