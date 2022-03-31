import { ActionContext } from 'vuex';
import { MainTree } from '.';
import Axios from 'axios';
import { SceneActionContext } from '@/store/scene';
import { MainScene } from '@/core/MainScene';
import { Animation_Sequence } from '@/core/animation/Animation_Sequence';
import { Animation_Character } from '@/core/Animation_Character';

export type PoseStore = {
  list: string[];
};
export type PoseActionContext = ActionContext<PoseStore, MainTree>;

export default {
  namespaced: true,
  state: {
    list: [],
  },
  mutations: {
    SET_LIST(state: PoseStore, list: string[]): void {
      state.list = list;
    },
  },
  actions: {
    async getList(action: PoseActionContext): Promise<void> {
      const list = (await Axios.get(`${action.rootState.main.API_URL}/pose/list`)).data
        .response as string[];
      action.commit('SET_LIST', list);
    },
    async load(action: PoseActionContext, name: string): Promise<void> {
      const pose = (await Axios.get(`${action.rootState.main.API_URL}/pose?name=${name}`)).data
        .response;

      // Set animation to character
      const character: Animation_Character = MainScene.selectedObject?.userData?.class;
      if (character) {
        for (const rig of character.rigList) {
          rig.positionOffset.set(
            pose.keys[rig.bone.name].position.x,
            pose.keys[rig.bone.name].position.y,
            pose.keys[rig.bone.name].position.z,
          );
          rig.rotationOffset.set(
            pose.keys[rig.bone.name].rotation.x,
            pose.keys[rig.bone.name].rotation.y,
            pose.keys[rig.bone.name].rotation.z,
            pose.keys[rig.bone.name].rotation.w,
          );
        }
        character.tick();
        MainScene.ui.timeline.refresh();
        MainScene.ui.main.refresh();
      }
    },
    async save(action: SceneActionContext, payload: { name: string; data: string }): Promise<void> {
      await Axios.post(`${action.rootState.main.API_URL}/pose`, payload);
    },
  },
};
