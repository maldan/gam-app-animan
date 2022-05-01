import { AM_Key } from '@/core/animation/key/AM_Key';
import { AM_IVector2 } from '@/core/AM_Type';
import * as THREE from 'three';

export class AM_KeyVector2 extends AM_Key {
  private _value: AM_IVector2 = { x: 0, y: 0 };

  constructor(name: string, v: AM_IVector2 | THREE.Vector2) {
    super();
    this.name = name;
    if (v instanceof THREE.Vector2) {
      this._value = {
        x: v.x,
        y: v.y,
      };
    } else {
      this._value = v;
    }
  }

  public interpolate(from: AM_KeyVector2, to: AM_KeyVector2, len: number): AM_KeyVector2[] {
    if (len <= 1) return [];
    const stepSize = 1 / len;
    const list = [];

    for (let i = 0; i < len - 1; i++) {
      const newKey = new AM_KeyVector2(from.name, { x: 0, y: 0 });

      newKey.isAuto = true;
      newKey.value.x = from.value.x + (to.value.x - from.value.x) * ((i + 1) * stepSize);
      newKey.value.y = from.value.y + (to.value.y - from.value.y) * ((i + 1) * stepSize);

      list.push(newKey);
    }

    return list;
  }

  public set value(v: AM_IVector2) {
    this._value = v;
  }

  public get value(): AM_IVector2 {
    return this._value;
  }

  public clone(): AM_KeyVector2 {
    const k = new AM_KeyVector2(this.name, { x: this.value.x, y: this.value.y });
    k.isAuto = this.isAuto;
    return k;
  }
}
