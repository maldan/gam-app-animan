import { ActionContext } from 'vuex';
import { MainTree } from '.';
import { AM_Object } from '@/core/am/AM_Object';

export type SceneStore = {
  objectList: AM_Object[];
};
export type SceneActionContext = ActionContext<SceneStore, MainTree>;

export default {
  namespaced: true,
  state: {
    objectList: [],
  },
  mutations: {
    ADD_OBJECT(state: SceneStore, obj: AM_Object): void {
      state.objectList.push(obj);
    },
  },
  actions: {
    addObject(action: SceneActionContext, obj: AM_Object): void {
      action.commit('ADD_OBJECT', obj);
    },
  },
};
