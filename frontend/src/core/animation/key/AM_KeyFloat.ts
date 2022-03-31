import { AM_Key } from '@/core/animation/key/AM_Key';

export class AM_KeyFloat extends AM_Key {
  private _value = 0;

  constructor(v: number) {
    super();
    this._value = v;
  }

  public set value(v: number) {
    this._value = v;
  }

  public get value(): number {
    return this._value;
  }
}
