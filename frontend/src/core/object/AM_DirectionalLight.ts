import * as THREE from 'three';
import { AM_Object } from '@/core/object/AM_Object';
import { AM_IVector3, AM_IVector4 } from '@/core/AM_Type';
import { AM_Core } from '@/core/AM_Core';

export class AM_DirectionalLight extends AM_Object {
  private readonly _xx!: THREE.ArrowHelper;

  constructor() {
    const l = new THREE.DirectionalLight();
    super(l);
    l.target = new THREE.Object3D();
    AM_Core.scene.add(l.target);

    /*const box = new THREE.BoxHelper(l.target, 0xff0000ff);
    AM_Core.scene.add(box);*/

    this._xx = new THREE.ArrowHelper(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 0),
      0.1,
      0xff0000,
    );
    AM_Core.scene.add(this._xx);
  }

  public update(): void {
    super.update();

    const v = new THREE.Vector3(0, 0, -0.1);
    v.applyQuaternion(this.model.quaternion);
    const v2 = new THREE.Vector3(this.position.x, this.position.y, this.position.z).add(v);
    this.light.target.position.set(v2.x, v2.y, v2.z);

    this._xx.position.set(
      this.light.target.position.x,
      this.light.target.position.y,
      this.light.target.position.z,
    );
    this._xx.setDirection(v);
  }

  public get light(): THREE.DirectionalLight {
    return this.model as THREE.DirectionalLight;
  }

  public get kind(): string {
    return 'directionalLight';
  }

  public destroy(): void {
    AM_Core.scene.remove(this.light.target);
    super.destroy();
  }
}
