import { Animation_Character } from '@/core/Animation_Character';
import { ActionContext } from 'vuex';
import { MainTree } from '.';
import { Animation_Sequence } from '@/core/Animation_Sequence';

export type SceneStore = {
  SelectedCharacter?: Animation_Character;
};
export type SceneActionContext = ActionContext<SceneStore, MainTree>;

export default {
  namespaced: true,
  state: {
    SelectedCharacter: undefined,
  },
  mutations: {
    SET_SELECTED_CHARACTER(state: SceneStore, character: Animation_Character): void {
      state.SelectedCharacter = character;
    },
    SET_ANIMATION(state: SceneStore, animation: Animation_Sequence): void {
      if (state.SelectedCharacter) {
        state.SelectedCharacter.animation = animation;
      }
    },
  },
  actions: {
    selectCharacter(action: SceneActionContext, character: Animation_Character): void {
      action.commit('SET_SELECTED_CHARACTER', character);
    },
    createAnimation(action: SceneActionContext): void {
      action.commit('SET_ANIMATION', new Animation_Sequence());
    },
  },
};
