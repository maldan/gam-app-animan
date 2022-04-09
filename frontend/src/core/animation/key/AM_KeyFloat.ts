import { AM_Key } from '@/core/animation/key/AM_Key';

export class AM_KeyFloat extends AM_Key {
  private _value = 0;

  constructor(name: string, v: number) {
    super();
    this.name = name;
    this._value = v;
  }

  public interpolate(from: AM_KeyFloat, to: AM_KeyFloat, len: number): AM_KeyFloat[] {
    if (len <= 1) return [];
    const stepSize = 1 / len;
    const list = [];

    for (let i = 0; i < len - 1; i++) {
      const newKey = new AM_KeyFloat(from.name, 0);
      newKey.isAuto = true;
      newKey.value = from.value + (to.value - from.value) * ((i + 1) * stepSize);
      list.push(newKey);
    }

    return list;
  }

  public set value(v: number) {
    this._value = v;
  }

  public get value(): number {
    return this._value;
  }

  public clone(): AM_KeyFloat {
    const k = new AM_KeyFloat(this.name, this.value);
    k.isAuto = this.isAuto;
    return k;
  }
}
