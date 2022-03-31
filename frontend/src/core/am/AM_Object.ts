import { AM_Key } from '@/core/animation/key/AM_Key';
import { AM_AnimationController } from '@/core/animation/AM_AnimationController';

export interface AM_IObjectInfo {
  name: string;
  category: string;
  modelPath: string;
  previewPath: string;
}

export class AM_Object {
  public uuid = '';
  public name = '';
  public animationController: AM_AnimationController = new AM_AnimationController();
  public exposedKeys = ['transform.position', 'transform.rotation', 'transform.scale'];

  public position = { x: 0, y: 0, z: 0 };

  //#_threeObject!: THREE.Object3D;

  constructor() {}

  public applyAnimation(): void {
    const keys = this.animationController.currentKeys;
    for (const key in keys) this.applyKey(keys[key]);
  }

  public applyKey(key: AM_Key): void {
    // @ts-ignore
    this[key.name] = key.value;

    /*const prefix = key.split(':')[0].split('.')[0];
    const name = key.split(':')[0].split('.')[1];
    const type = key.split(':')[1];

    if (prefix === 'transform') {

    }*/
  }

  /*public getThreeObject(): THREE.Object3D {
    return this.#_threeObject;
  }

  public set position(value: AM_IVector3) {
    this.#_threeObject.position.set(value.x, value.y, value.z);
  }

  public get position(): AM_IVector3 {
    return {
      x: this.#_threeObject.position.x,
      y: this.#_threeObject.position.y,
      z: this.#_threeObject.position.z,
    };
  }

  public get rotation(): AM_IVector4 {
    return { x: 0, y: 0, z: 0, w: 1 };
  }

  public get scale(): AM_IVector3 {
    return { x: 0, y: 0, z: 0 };
  }*/
}
