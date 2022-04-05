import * as THREE from 'three';
import { AM_Key } from '@/core/animation/key/AM_Key';
import { AM_IVector4 } from '@/core/am/AM_Vector';

export class AM_KeyQuaternion extends AM_Key {
  private _value: AM_IVector4 = { x: 0, y: 0, z: 0, w: 0 };

  constructor(name: string, v: AM_IVector4) {
    super();
    this.name = name;
    this._value = v;
  }

  public interpolate(
    from: AM_KeyQuaternion,
    to: AM_KeyQuaternion,
    len: number,
  ): AM_KeyQuaternion[] {
    if (len <= 1) return [];
    const stepSize = 1 / len;
    const list = [];

    for (let i = 0; i < len - 1; i++) {
      const newKey = new AM_KeyQuaternion(from.name, { x: 0, y: 0, z: 0, w: 0 });

      newKey.isAuto = true;

      // Lerp quaternion
      const quatFrom = new THREE.Quaternion(from.value.x, from.value.y, from.value.z, from.value.w);
      const quatTo = new THREE.Quaternion(to.value.x, to.value.y, to.value.z, to.value.w);
      const quat = quatFrom.slerp(quatTo, (i + 1) * stepSize);

      newKey.value = { x: quat.x, y: quat.y, z: quat.z, w: quat.w };

      /*this.frames[fromId + i + 1].keys[keyName].rotation = new THREE.Quaternion(
        this.frames[fromId].keys[keyName].rotation.x,
        this.frames[fromId].keys[keyName].rotation.y,
        this.frames[fromId].keys[keyName].rotation.z,
        this.frames[fromId].keys[keyName].rotation.w,
      ).slerp(
        new THREE.Quaternion(
          this.frames[toId].keys[keyName].rotation.x,
          this.frames[toId].keys[keyName].rotation.y,
          this.frames[toId].keys[keyName].rotation.z,
          this.frames[toId].keys[keyName].rotation.w,
        ),
        (i + 1) * stepSize,
      );*/
      /*newKey.value.x = from.value.x + (to.value.x - from.value.x) * ((i + 1) * stepSize);
      newKey.value.y = from.value.y + (to.value.y - from.value.y) * ((i + 1) * stepSize);
      newKey.value.z = from.value.z + (to.value.z - from.value.z) * ((i + 1) * stepSize);
      newKey.value.w = from.value.w + (to.value.w - from.value.w) * ((i + 1) * stepSize);*/

      list.push(newKey);
    }

    return list;
  }

  public set value(v: AM_IVector4) {
    this._value = v;
  }

  public get value(): AM_IVector4 {
    return this._value;
  }

  public clone(): AM_KeyQuaternion {
    const k = new AM_KeyQuaternion(this.name, {
      x: this.value.x,
      y: this.value.y,
      z: this.value.z,
      w: this.value.w,
    });
    k.isAuto = this.isAuto;
    return k;
  }
}
