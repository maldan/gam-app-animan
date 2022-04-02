import { AM_Key } from '@/core/animation/key/AM_Key';
import { AM_IVector3 } from '@/core/am/AM_Vector';

export class AM_KeyVector3 extends AM_Key {
  private _value: AM_IVector3 = { x: 0, y: 0, z: 0 };

  constructor(name: string, v: AM_IVector3) {
    super();
    this.name = name;
    this._value = v;
  }

  public set value(v: AM_IVector3) {
    this._value = v;
  }

  public get value(): AM_IVector3 {
    return this._value;
  }
}
