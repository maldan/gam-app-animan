import * as THREE from 'three';
import { AM_Object } from '@/core/am/AM_Object';

export class AM_Bone extends AM_Object {
  public bone!: THREE.Bone;

  public startPosition: THREE.Vector3 = new THREE.Vector3();
  public startRotation: THREE.Quaternion = new THREE.Quaternion();

  public positionOffset: THREE.Vector3 = new THREE.Vector3();
  public rotationOffset: THREE.Quaternion = new THREE.Quaternion();
  public scaleOffset: THREE.Vector3 = new THREE.Vector3();

  public parent!: AM_Object;

  constructor(o: THREE.Mesh, parent: AM_Object, bone: THREE.Bone) {
    super(o);

    this.bone = bone;
    this.parent = parent;
    this.startRotation = bone.quaternion.clone();
    this.startPosition = bone.position.clone();
  }

  public update(): void {
    this.bone.setRotationFromQuaternion(this.startRotation.clone().multiply(this.rotationOffset));

    const gp = new THREE.Vector3();
    this.bone.getWorldPosition(gp);
    const gr = new THREE.Quaternion();
    this.bone.getWorldQuaternion(gr);

    this.position = { x: gp.x, y: gp.y, z: gp.z };
    this.rotation = { x: gr.x, y: gr.y, z: gr.z, w: gr.w };
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
