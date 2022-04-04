import { AM_Key } from '@/core/animation/key/AM_Key';
import { AM_IVector3 } from '@/core/am/AM_Vector';

export class AM_KeyVector3 extends AM_Key {
  private _value: AM_IVector3 = { x: 0, y: 0, z: 0 };

  constructor(name: string, v: AM_IVector3) {
    super();
    this.name = name;
    this._value = v;
  }

  public interpolate(from: AM_KeyVector3, to: AM_KeyVector3, len: number): AM_KeyVector3[] {
    if (len <= 1) return [];
    const stepSize = 1 / len;
    const list = [];

    for (let i = 0; i < len - 1; i++) {
      const newKey = new AM_KeyVector3(from.name, { x: 0, y: 0, z: 0 });

      newKey.isAuto = true;
      newKey.value.x = from.value.x + (to.value.x - from.value.x) * ((i + 1) * stepSize);
      newKey.value.y = from.value.y + (to.value.y - from.value.y) * ((i + 1) * stepSize);
      newKey.value.z = from.value.z + (to.value.z - from.value.z) * ((i + 1) * stepSize);

      list.push(newKey);
    }

    return list;
  }

  public set value(v: AM_IVector3) {
    this._value = v;
  }

  public get value(): AM_IVector3 {
    return this._value;
  }

  public clone(): AM_KeyVector3 {
    const k = new AM_KeyVector3(this.name, { x: this.value.x, y: this.value.y, z: this.value.z });
    k.isAuto = this.isAuto;
    return k;
  }
}
