import * as THREE from 'three';
import { AM_Object } from '@/core/am/AM_Object';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { AM_Animation } from '@/core/animation/AM_Animation';

export class AM_UI {
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
  public refresh(): void {
    this.main.refresh();
    this.scene.refresh();
    this.timeline.refresh();
  }
}

export class AM_State {
  public static ui: AM_UI = new AM_UI();

  public static objectList: AM_Object[] = [];
  public static selectedObject?: AM_Object;
  public static selectedAnimation?: AM_Animation;

  public static addObject(obj: AM_Object): void {
    this.objectList.push(obj);
    this.ui.refresh();
  }

  public static selectObject(obj: AM_Object): void {
    this.selectedObject?.onUnselect();
    this.selectedObject = obj;
    this.selectedObject.onSelect();
    this.ui.refresh();
  }

  public static removeObject(obj: AM_Object): void {
    const index = this.objectList.indexOf(obj);
    if (index !== -1) this.objectList.splice(index, 1);
    if (obj) obj.destroy();
    this.ui.scene.refresh();
  }

  public static async loadObject(path: string): Promise<AM_Object> {
    const loader = new GLTFLoader();

    return new Promise((resolve, reject) => {
      loader.load(
        path,
        (gltf) => {
          const object = gltf.scene.children[0] as THREE.Object3D;

          object.traverse(function (child) {
            if ((child as THREE.Mesh).isMesh) {
              if ((child as THREE.Mesh).material) {
                ((child as THREE.Mesh).material as THREE.MeshPhongMaterial).shininess = 2;
                ((child as THREE.Mesh).material as THREE.MeshPhongMaterial).reflectivity = 0.1;
              }
            }
          });

          /*const characterName = path.split('/').pop()?.replace('.glb', '') || 'Unknown';

          const ch = new Animation_Character();
          ch.init(characterName, object, this.scene);

          object.userData.tag = 'Character';
          object.userData.class = ch;
          object.name = characterName;
          console.log(object);
          this.addToScene(object);*/

          const obj = new AM_Object(object);
          obj.uuid = object.uuid;
          obj.name = object.name;
          resolve(obj);
        },
        (xhr) => {},
        (error) => {
          reject(error);
        },
      );
    });
  }
}
