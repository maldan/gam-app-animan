export class AM_Key {
  public isAuto = false;
  public name = '';

  constructor() {}

  public interpolate(from: AM_Key, to: AM_Key, len: number): AM_Key[] {
    return [];
  }

  public get value(): unknown {
    return null;
  }
}
