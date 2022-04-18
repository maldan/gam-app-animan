import * as THREE from 'three';
import { AM_Object } from '@/core/am/AM_Object';

export class AM_Bone extends AM_Object {
  public bone!: THREE.Bone;

  public startPosition: THREE.Vector3 = new THREE.Vector3();
  public startRotation: THREE.Quaternion = new THREE.Quaternion();
  public startScale: THREE.Vector3 = new THREE.Vector3();

  public positionOffset: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  public rotationOffset: THREE.Quaternion = new THREE.Quaternion();
  public scaleOffset: THREE.Vector3 = new THREE.Vector3();

  public parent!: AM_Object;

  constructor(o: THREE.Mesh, parent: AM_Object, bone: THREE.Bone) {
    super(o);

    this.bone = bone;
    this.parent = parent;
    this.startRotation = bone.quaternion.clone();
    this.startPosition = bone.position.clone();
    this.startScale = bone.scale.clone();
  }

  public update(): void {
    // Set bone trs
    this.bone.position
      .set(this.startPosition.x, this.startPosition.y, this.startPosition.z)
      .add(this.positionOffset);

    if (this.bone.name === 'Head_1')
      console.log(this.startPosition, this.positionOffset, this.bone.position);

    this.bone.setRotationFromQuaternion(this.startRotation.clone().multiply(this.rotationOffset));
    this.bone.scale
      .set(this.startScale.x, this.startScale.y, this.startScale.z)
      .add(this.scaleOffset);

    // Calculate helper position
    const gp = new THREE.Vector3();
    this.bone.getWorldPosition(gp);
    const gr = new THREE.Quaternion();
    this.bone.getWorldQuaternion(gr);
    const gs = new THREE.Vector3();
    this.bone.getWorldScale(gs);

    this.position = { x: gp.x, y: gp.y, z: gp.z };
    this.rotation = { x: gr.x, y: gr.y, z: gr.z, w: gr.w };
    this.scale = { x: gs.x, y: gs.y, z: gs.z };
  }

  public onSelect(): void {
    super.onSelect();

    // @ts-ignore
    this.model.material.color.set(0x00ff00);
    // @ts-ignore
    this.model.material.opacity = 0.7;
  }

  public onUnselect(): void {
    super.onUnselect();

    // @ts-ignore
    this.model.material.color.set(0xffffff);
    // @ts-ignore
    this.model.material.opacity = 0.15;
  }

  public mirrorFromBone(fromBone: AM_Bone): void {
    const r = new THREE.Quaternion(
      fromBone.rotationOffset.x,
      fromBone.rotationOffset.y,
      fromBone.rotationOffset.z,
      fromBone.rotationOffset.w,
    );
    const e = new THREE.Euler().setFromQuaternion(r);
    e.y *= -1;
    e.z *= -1;
    const nr = new THREE.Quaternion().setFromEuler(e);

    this.rotationOffset.x = nr.x;
    this.rotationOffset.y = nr.y;
    this.rotationOffset.z = nr.z;
    this.rotationOffset.w = nr.w;

    this.update();
  }

  public reset(): void {
    this.rotationOffset.set(0, 0, 0, 1);
    this.scaleOffset.set(1, 1, 1);
    this.positionOffset.set(0, 0, 0);
    this.update();
  }

  public get isRotationOffsetIsChanged(): boolean {
    if (this.rotationOffset.x != 0) return true;
    if (this.rotationOffset.y != 0) return true;
    if (this.rotationOffset.z != 0) return true;
    if (this.rotationOffset.w != 1) return true;
    return false;
  }
}
