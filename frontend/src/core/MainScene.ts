import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { Animation_Character } from '@/core/Animation_Character';
import * as THREE from 'three';
import { DataStorage } from '@/core/DataStorage';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

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
  public blendShape = {
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
  public static isPlayAnimation = false;

  public static init(): void {}

  public static addToScene(obj: THREE.Object3D): void {
    this.scene.add(obj);
    setTimeout(() => {
      this.ui.scene.refresh();
    }, 16);
  }

  public static removeObject(obj: THREE.Object3D | undefined): void {
    if (obj) this.scene.remove(obj);

    this.selectedObject = undefined;

    setTimeout(() => {
      this.ui.main.refresh();
      this.ui.timeline.refresh();
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
      this.ui.blendShape.refresh();
    }, 16);
  }

  public static loadCharacter(path: string): void {
    // Instantiate a loader
    const loader = new GLTFLoader();

    loader.load(
      path,

      (gltf) => {
        const object = gltf.scene.children[0] as THREE.Object3D;

        object.traverse(function (child) {
          if ((child as THREE.Mesh).isMesh) {
            if ((child as THREE.Mesh).material) {
              ((child as THREE.Mesh).material as THREE.MeshPhongMaterial).shininess = 2;
              ((child as THREE.Mesh).material as THREE.MeshPhongMaterial).reflectivity = 0.1;
              // ((child as THREE.Mesh).material as THREE.MeshPhongMaterial).wireframe = true;
            }
          }
        });

        const characterName = path.split('/').pop()?.replace('.glb', '') || 'Unknown';

        const ch = new Animation_Character();
        ch.init(characterName, object, this.scene);

        object.userData.tag = 'Character';
        object.userData.class = ch;
        object.name = characterName;
        console.log(object);
        this.addToScene(object);
      },
      (xhr) => {},
      (error) => {},
    );
    /*const fbxLoader = new FBXLoader();
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
        // console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
      },
      (error) => {
        // console.log(error);
      },
    );*/
  }
}
