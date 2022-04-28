import * as THREE from 'three';
import { AM_Object } from '@/core/am/AM_Object';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { AM_Animation } from '@/core/animation/AM_Animation';
import { AM_AnimationController, AM_IAnimationPart } from '@/core/animation/AM_AnimationController';
import { AM_Core } from '@/core/AM_Core';
import { AM_Character } from '@/core/am/AM_Character';
import { AM_Bone } from '@/core/am/AM_Bone';
import { AM_IResourceInfo } from '@/core/AM_Type';

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
    refs: [] as unknown[],
    addRef(x: unknown): void {
      this.refs.push(x);
    },
    removeRef(x: unknown): void {
      this.refs.splice(this.refs.indexOf(x), 1);
    },
    refresh(): void {
      this.refs.forEach((x: any) => x.refresh());
    },
  };
  public rig = {
    ref: undefined as any,
    refresh(): void {
      this.ref?.refresh();
    },
  };
  public shape = {
    ref: undefined as any,
    refresh(): void {
      this.ref?.refresh();
    },
  };
  public project = {
    ref: undefined as any,
    refresh(): void {
      this.ref?.refresh();
    },
  };
  public clipEditor = {
    ref: undefined as any,
    refresh(): void {
      this.ref?.refresh();
    },
  };
  public refresh(): void {
    this.main.refresh();
    this.scene.refresh();
    this.timeline.refresh();
    this.shape.refresh();
    this.project.refresh();
    this.clipEditor.refresh();
  }
}

export class AM_State {
  public static ui: AM_UI = new AM_UI();

  public static objectList: AM_Object[] = [];
  public static selectedObject?: AM_Object;
  //public static selectedAnimation?: AM_Animation;
  //public static selectedAnimationPart?: AM_IAnimationPart;
  public static animationController: AM_AnimationController = new AM_AnimationController();
  public static isAnimationPlay = false;
  public static animationTime = 0;
  public static mode = '';
  public static clipInfo?: AM_IResourceInfo;
  public static animationInfo?: AM_IResourceInfo;
  public static poseInfo?: AM_IResourceInfo;
  public static animationObjectList: AM_Object[] = [];

  private static _globalFrameId = 0;
  private static _eventList: Record<string, ((...data: unknown[]) => void)[]> = {};

  public static get globalFrameId(): number {
    return this._globalFrameId;
  }

  public static set globalFrameId(v: number) {
    if (v <= 0) v = 0;

    const l = AM_State.objectList.filter((x) => !(x instanceof AM_Bone));
    l.forEach((x) => {
      x.animationController.animation.frameId = v;
      x.applyAnimation(x.animationController.animation);
    });
    this._globalFrameId = v;
  }

  public static init(): void {
    this.animationController.off('change');
    this.animationController.on('change', () => {
      this.objectList
        .filter((x) => x instanceof AM_Character)
        .forEach((x) => {
          x.applyAnimation(this.animationController?.animation);
        });
      this.ui.timeline.refresh();
    });
  }

  public static destroy(): void {
    this.animationController.off('change');
    this.objectList.length = 0;
    this.animationObjectList.length = 0;
    this.selectedObject = undefined;
    //this.selectedAnimation = undefined;
    //this.selectedAnimationPart = undefined;
    this.isAnimationPlay = false;

    this._eventList = {};
  }

  public static addAnimationObject(obj: AM_Object): void {
    if (this.animationObjectList.indexOf(obj) !== -1) return;
    this.animationObjectList.push(obj);
    this.ui.refresh();
  }

  public static removeAnimationObject(obj: AM_Object): void {
    const index = this.animationObjectList.indexOf(obj);
    if (index === -1) return;
    this.animationObjectList.splice(index, 1);
    this.ui.refresh();
  }

  public static addObject(obj: AM_Object): void {
    this.objectList.push(obj);
    this.ui.refresh();
    this.emit('addObject', obj);
  }

  public static selectObject(obj: AM_Object | undefined): void {
    // Obj changed
    /*if (obj instanceof AM_Bone) {
      if (this.selectedObject instanceof AM_Bone) {
      } else {
        if (obj.parent !== this.selectedObject) this.selectedAnimation = undefined;
      }
    } else {
      if (this.selectedObject instanceof AM_Bone) {
        if (obj !== this.selectedObject.parent) this.selectedAnimation = undefined;
      } else if (obj !== this.selectedObject) this.selectedAnimation = undefined;
    }*/

    this.selectedObject?.onUnselect();
    this.selectedObject = obj;
    this.selectedObject?.onSelect();

    AM_Core.setManipulatorTo(obj);

    this.ui.refresh();
  }

  public static removeObject(obj: AM_Object | undefined): void {
    if (!obj) return;

    if (this.selectedObject === obj) {
      AM_Core.setManipulatorTo(undefined);
      this.selectObject(undefined);
    }

    const index = this.objectList.indexOf(obj);
    if (index !== -1) this.objectList.splice(index, 1);
    if (obj) obj.destroy();
    this.ui.scene.refresh();

    this.emit('removeObject', obj);
  }

  public static async loadObject(path: string, type = ''): Promise<AM_Object> {
    const loader = new GLTFLoader();

    return new Promise((resolve, reject) => {
      loader.load(
        path,
        (gltf) => {
          const object = gltf.scene.children[0] as THREE.Object3D;

          object.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              //child.geometry.computeBoundingSphere();

              child.castShadow = true;
              child.receiveShadow = true;
              // console.log(child.material);
            }
          });
          /* object.traverse(function (child) {
            if ((child as THREE.Mesh).isMesh) {
              if ((child as THREE.Mesh).material) {
                ((child as THREE.Mesh).material as THREE.MeshPhongMaterial).shininess = 2;
                ((child as THREE.Mesh).material as THREE.MeshPhongMaterial).reflectivity = 0.1;
              }
            }
          });*/

          /*const characterName = path.split('/').pop()?.replace('.glb', '') || 'Unknown';

          const ch = new Animation_Character();
          ch.init(characterName, object, this.scene);

          object.userData.tag = 'Character';
          object.userData.class = ch;
          object.name = characterName;
          console.log(object);
          this.addToScene(object);*/

          if (type === 'character') {
            const obj = new AM_Character(object);

            obj.id = object.uuid;
            obj.name = object.name;
            resolve(obj);
          } else {
            const obj = new AM_Object(object);

            obj.id = object.uuid;
            obj.name = object.name;
            resolve(obj);
          }
        },
        (xhr) => {},
        (error) => {
          reject(error);
        },
      );
    });
  }

  public static on(eventName: string, fn: (...data: unknown[]) => void): void {
    if (!this._eventList[eventName]) this._eventList[eventName] = [];
    this._eventList[eventName].push(fn);
  }

  public static off(eventName: string): void {
    if (this._eventList[eventName]) this._eventList[eventName].length = 0;
  }

  public static emit(eventName: string, ...data: unknown[]): void {
    if (!this._eventList[eventName]) return;
    for (let i = 0; i < this._eventList[eventName].length; i++) {
      this._eventList[eventName][i](...data);
    }
  }
}
