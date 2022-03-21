import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { Animation_Character } from '@/core/Animation_Character';
import * as THREE from 'three';

export class UI {
  public scene = {
    ref: undefined as any,
    refresh(): void {
      this.ref?.refresh();
    },
  };
  public main = {
    ref: undefined as any,
    refresh(): void {
      this.ref?.refresh();
    },
  };
  public timeline = {
    ref: undefined as any,
    refresh(): void {
      this.ref?.refresh();
    },
  };
  public rig = {
    ref: undefined as any,
    refresh(): void {
      this.ref?.refresh();
    },
  };
}

export class MainScene {
  public static scene: THREE.Scene;
  public static selectedObject?: THREE.Object3D;
  public static ui: UI = new UI();
  public static timelineTimer = 0;

  public static init(): void {}

  public static addToScene(obj: THREE.Object3D): void {
    this.scene.add(obj);
    setTimeout(() => {
      this.ui.scene.refresh();
    }, 16);
  }

  public static selectObject(obj: THREE.Object3D | undefined): void {
    this.selectedObject = obj;
    setTimeout(() => {
      this.ui.main.refresh();
      this.ui.timeline.refresh();
    }, 16);
  }

  public static loadCharacter(path: string): void {
    const fbxLoader = new FBXLoader();
    fbxLoader.load(
      path,
      (object) => {
        const characterName = path.split('/').pop()?.replace('.fbx', '') || 'Unknown';

        const ch = new Animation_Character();
        ch.init(characterName, object, this.scene);

        object.userData.tag = 'Character';
        object.userData.class = ch;
        object.name = characterName;

        this.addToScene(object);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
      },
      (error) => {
        console.log(error);
      },
    );
  }
}
