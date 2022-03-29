import * as THREE from 'three';

export class Animation_Key {
  public type = 0; // 0 - default, 1 - shape key
  public isAuto = false;

  public position = { x: 0, y: 0, z: 0 };
  public rotation = { x: 0, y: 0, z: 0, w: 1 };
  public scale = { x: 1, y: 1, z: 1 };
  public value = 0;

  constructor(keys?: any) {
    if (keys) {
      this.type = keys.type;
      this.position = keys.position;
      this.rotation = keys.rotation;
      this.scale = keys.scale;
      this.value = keys.value;
    }
  }

  public mirrorRotation(): void {
    const r = new THREE.Quaternion(
      this.rotation.x,
      this.rotation.y,
      this.rotation.z,
      this.rotation.w,
    );
    const e = new THREE.Euler().setFromQuaternion(r);
    e.y *= -1;
    e.z *= -1;
    const nr = new THREE.Quaternion().setFromEuler(e);

    this.rotation.x = nr.x;
    this.rotation.y = nr.y;
    this.rotation.z = nr.z;
    this.rotation.w = nr.w;
  }

  public clone(): Animation_Key {
    const k = new Animation_Key();
    k.type = this.type;
    k.isAuto = this.isAuto;
    k.position = { ...this.position };
    k.rotation = { ...this.rotation };
    k.scale = { ...this.scale };
    k.value = this.value;

    return k;
  }
}
