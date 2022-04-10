import * as THREE from 'three';
import { AM_Key } from '@/core/animation/key/AM_Key';
import { AM_AnimationController } from '@/core/animation/AM_AnimationController';
import { AM_Core } from '@/core/AM_Core';
import { AM_Animation } from '@/core/animation/AM_Animation';
import { AM_IVector3, AM_IVector4 } from '@/core/AM_Type';

export class AM_Object {
  public uuid = '';
  public name = '';
  public animationController: AM_AnimationController = new AM_AnimationController();
  public exposedKeys = ['transform.position', 'transform.rotation', 'transform.scale'];

  #_threeObject!: THREE.Object3D;

  constructor(o: THREE.Object3D) {
    this.#_threeObject = o;
    AM_Core.scene.add(o);

    // Set object
    o.traverse((object) => {
      object.userData.amObject = this;
    });
  }

  public applyAnimation(animation: AM_Animation | undefined): void {
    if (!animation) return;
    if (!animation.currentFrame) return;
    const keys = animation.currentFrame.keys;
    for (const key in keys) this.applyKey(keys[key]);
    this.update();
  }

  public applyKey(key: AM_Key): void {
    const prefix = key.name.split('.')[0];
    const name = key.name.split('.')[1];

    if (prefix === 'transform') {
      // @ts-ignore
      this[name] = key.value;
    }
  }

  public update(): void {}

  public onSelect(): void {}

  public onUnselect(): void {}

  public set visible(status: boolean) {
    this.#_threeObject.visible = status;
  }

  public get visible(): boolean {
    return this.#_threeObject.visible;
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

  public set rotation(value: AM_IVector4) {
    this.#_threeObject.quaternion.set(value.x, value.y, value.z, value.w);
  }

  public get rotation(): AM_IVector4 {
    return {
      x: this.#_threeObject.quaternion.x,
      y: this.#_threeObject.quaternion.y,
      z: this.#_threeObject.quaternion.z,
      w: this.#_threeObject.quaternion.w,
    };
  }

  public get scale(): AM_IVector3 {
    return {
      x: this.#_threeObject.scale.x,
      y: this.#_threeObject.scale.y,
      z: this.#_threeObject.scale.z,
    };
  }

  public get model(): THREE.Object3D {
    return this.#_threeObject;
  }

  public destroy(): void {
    AM_Core.scene.remove(this.#_threeObject);
  }
}
