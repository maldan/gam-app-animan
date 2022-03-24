import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { Animation_Character } from '@/core/Animation_Character';
import * as THREE from 'three';
import { DataStorage } from '@/core/DataStorage';

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
    const previousSelected = this.selectedObject;

    // Set selection
    this.selectedObject = obj;

    if (obj instanceof THREE.DirectionalLight) {
      DataStorage.setManipulatorTo(obj);
    }

    // On select event
    if (this.selectedObject?.userData.tag === 'Character')
      this.selectedObject.userData.class.onSelect();

    // Deselect previous
    if (previousSelected?.userData.tag === 'Character')
      previousSelected.userData.class.onUnselect();

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
        object.traverse(function (child) {
          if ((child as THREE.Mesh).isMesh) {
            if ((child as THREE.Mesh).material) {
              ((child as THREE.Mesh).material as THREE.MeshPhongMaterial).shininess = 2;
              ((child as THREE.Mesh).material as THREE.MeshPhongMaterial).reflectivity = 0.1;
              // ((child as THREE.Mesh).material as THREE.MeshPhongMaterial).wireframe = true;
            }
          }
        });

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
