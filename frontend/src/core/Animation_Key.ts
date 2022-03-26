export class Animation_Key {
  public type = 0; // 0 - default, 1 - shape key
  public isAuto = false;

  public position = { x: 0, y: 0, z: 0 };
  public rotation = { x: 0, y: 0, z: 0, w: 1 };
  public scale = { x: 1, y: 1, z: 1 };
  public value = 0;

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
