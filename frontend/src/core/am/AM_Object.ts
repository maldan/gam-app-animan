import * as THREE from 'three';
import { AM_Key } from '@/core/animation/key/AM_Key';
import { AM_AnimationController } from '@/core/animation/AM_AnimationController';
import { AM_IVector3, AM_IVector4 } from '@/core/am/AM_Vector';
import { AM_Core } from '@/core/AM_Core';

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

  #_threeObject!: THREE.Object3D;

  constructor(o: THREE.Object3D) {
    this.#_threeObject = o;
    AM_Core.scene.add(o);

    /*this.animationController.on('change', () => {
      this.applyAnimation();
    });*/
  }

  public applyAnimation(): void {
    const keys = this.animationController.currentKeys;
    for (const key in keys) this.applyKey(keys[key]);
  }

  public applyKey(key: AM_Key): void {
    const prefix = key.name.split('.')[0];
    const name = key.name.split('.')[1];

    if (prefix === 'transform') {
      // @ts-ignore
      this[name] = key.value;
    }

    /*
    const type = key.split(':')[1];

    if (prefix === 'transform') {

    }*/
  }

  public onSelect(): void {
    console.log('salected');
  }

  public onUnselect(): void {
    console.log('un salected');
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
  }

  public get model(): THREE.Object3D {
    return this.#_threeObject;
  }

  public destroy(): void {
    AM_Core.scene.remove(this.#_threeObject);
  }
}
