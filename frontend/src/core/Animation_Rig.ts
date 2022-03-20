import * as THREE from 'three';

export class Animation_Rig {
  public bone!: THREE.Bone;
  public boneHelper!: THREE.Object3D;

  public boneStartPosition: THREE.Vector3 = new THREE.Vector3();
  public boneStartRotation: THREE.Quaternion = new THREE.Quaternion();
  public positionOffset: THREE.Vector3 = new THREE.Vector3();
  public rotationOffset: THREE.Quaternion = new THREE.Quaternion();

  constructor(bone: THREE.Bone, helper: THREE.Object3D) {
    this.bone = bone;
    this.boneHelper = helper;
    this.boneStartRotation = bone.quaternion.clone();
    this.boneStartPosition = bone.position.clone();
  }

  public tick(): void {
    const gp = new THREE.Vector3();
    this.bone.getWorldPosition(gp);
    const gr = new THREE.Quaternion();
    this.bone.getWorldQuaternion(gr);

    this.boneHelper.position.set(gp.x, gp.y, gp.z);
    this.boneHelper.quaternion.set(gr.x, gr.y, gr.z, gr.w);
  }
}
