export class AM_Key {
  public isAuto = false;
  public name = '';

  constructor() {}

  public interpolate(from: AM_Key, to: AM_Key, len: number): AM_Key[] {
    return [];
  }

  public set value(v: unknown) {}

  public get value(): unknown {
    return null;
  }

  public clone(): AM_Key {
    const k = new AM_Key();
    k.isAuto = this.isAuto;
    k.name = this.name;
    k.value = this.value;
    return k;
  }
}
