export class Animation_Key {
  public type = 0; // 0 - default, 1 - shape key
  public isAuto = false;

  public position = { x: 0, y: 0, z: 0 };
  public rotation = { x: 0, y: 0, z: 0, w: 1 };
  public scale = { x: 1, y: 1, z: 1 };
  public value = 0;
}
