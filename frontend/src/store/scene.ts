import { Animation_Character } from '@/core/Animation_Character';
import { ActionContext } from 'vuex';
import { MainTree } from '.';
import { Animation_Sequence } from '@/core/Animation_Sequence';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

export type SceneStore = {
  //selectedCharacter?: Animation_Character;
  objectList: THREE.Object3D[];
  selectedObject: THREE.Object3D;
  scene: THREE.Scene;
};
export type SceneActionContext = ActionContext<SceneStore, MainTree>;

export default {
  namespaced: true,
  state: {
    //selectedCharacter: undefined,
    selectedObject: undefined,
    objectList: [],
    scene: undefined,
  },
  mutations: {
    SET_SELECTED_OBJECT(state: SceneStore, obj: THREE.Object3D): void {
      state.selectedObject = obj;
    },
    /*SET_SELECTED_CHARACTER(state: SceneStore, character: Animation_Character): void {
      state.selectedCharacter = character;
    },*/
    SET_ANIMATION(state: SceneStore, animation: Animation_Sequence): void {
      if (state.selectedObject?.userData?.tag === 'Character') {
        state.selectedObject.userData.class.animation = animation;
      }
    },
    SET_SCENE(state: SceneStore, scene: THREE.Scene): void {
      state.scene = scene;
    },
    ADD_TO_SCENE(state: SceneStore, object: THREE.Object3D): void {
      state.scene.add(object);
      state.objectList.push(object);
      console.log(object);
    },
  },
  actions: {
    /*selectCharacter(action: SceneActionContext, character: Animation_Character): void {
      action.commit('SET_SELECTED_CHARACTER', character);
    },*/
    createAnimation(action: SceneActionContext): void {
      action.commit('SET_ANIMATION', new Animation_Sequence({ frameCount: 48 }));
    },
    setScene(action: SceneActionContext, scene: THREE.Scene): void {
      action.commit('SET_SCENE', scene);
    },
    addToScene(action: SceneActionContext, object: THREE.Object3D): void {
      action.commit('ADD_TO_SCENE', object);
    },
    selectObject(action: SceneActionContext, object: THREE.Object3D): void {
      action.commit('SET_SELECTED_OBJECT', object);
    },
    loadCharacter(action: SceneActionContext, path: string): void {
      const fbxLoader = new FBXLoader();
      fbxLoader.load(
        path,
        (object) => {
          const characterName = path.split('/').pop()?.replace('.fbx', '') || 'Unknown';

          const ch = new Animation_Character();
          ch.init(characterName, object);

          object.userData.tag = 'Character';
          object.userData.class = ch;
          object.name = characterName;

          action.dispatch('addToScene', object);
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
        },
        (error) => {
          console.log(error);
        },
      );
    },
  },
};
