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

  public reset(): void {
    this.rotationOffset.set(0, 0, 0, 1);
    this.scaleOffset.set(1, 1, 1);
    this.positionOffset.set(0, 0, 0);
    this.update();
  }

  /*public bone!: THREE.Bone;
  public boneHelper!: THREE.Mesh;

  public startPosition: THREE.Vector3 = new THREE.Vector3();
  public startRotation: THREE.Quaternion = new THREE.Quaternion();

  public positionOffset: THREE.Vector3 = new THREE.Vector3();
  public rotationOffset: THREE.Quaternion = new THREE.Quaternion();
  public scaleOffset: THREE.Vector3 = new THREE.Vector3();

  constructor(bone: THREE.Bone, helper: THREE.Mesh) {
    this.bone = bone;
    this.boneHelper = helper;
    this.startRotation = bone.quaternion.clone();
    this.startPosition = bone.position.clone();
  }

  public tick(): void {
    this.bone.setRotationFromQuaternion(this.startRotation.clone().multiply(this.rotationOffset));

    const gp = new THREE.Vector3();
    this.bone.getWorldPosition(gp);
    const gr = new THREE.Quaternion();
    this.bone.getWorldQuaternion(gr);

    this.boneHelper.position.set(gp.x, gp.y, gp.z);
    this.boneHelper.quaternion.set(gr.x, gr.y, gr.z, gr.w);
  }*/
}
