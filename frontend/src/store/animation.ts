import { ActionContext } from 'vuex';
import { MainTree } from '.';
import Axios from 'axios';
import { SceneActionContext } from '@/store/scene';
import { MainScene } from '@/core/MainScene';
import { Animation_Sequence } from '@/core/Animation_Sequence';

export type AnimationStore = {
  list: string[];
};
export type AnimationActionContext = ActionContext<AnimationStore, MainTree>;

export default {
  namespaced: true,
  state: {
    list: [],
  },
  mutations: {
    SET_LIST(state: AnimationStore, list: string[]): void {
      state.list = list;
    },
  },
  actions: {
    async getList(action: AnimationActionContext): Promise<void> {
      const list = (await Axios.get(`${action.rootState.main.API_URL}/animation/list`)).data
        .response as string[];
      action.commit('SET_LIST', list);
    },
    async load(action: AnimationActionContext, name: string): Promise<void> {
      const animation = (await Axios.get(`${action.rootState.main.API_URL}/animation?name=${name}`))
        .data.response;

      // Set animation to character
      const character = MainScene.selectedObject?.userData?.class;
      if (character) {
        character.animation = new Animation_Sequence({
          frameCount: animation.frameCount,
          fps: animation.fps,
          frames: animation.frames,
        });
        MainScene.ui.timeline.refresh();
      }
    },
    async save(action: SceneActionContext, payload: { name: string; data: string }): Promise<void> {
      await Axios.post(`${action.rootState.main.API_URL}/animation`, payload);
    },
  },
};
