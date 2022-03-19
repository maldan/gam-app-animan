import * as THREE from 'three';

export class Animation_Rig {
  public bone!: THREE.Bone;
  public boneStartPosition: THREE.Vector3 = new THREE.Vector3();
  public boneStartRotation: THREE.Quaternion = new THREE.Quaternion();
  public positionOffset: THREE.Vector3 = new THREE.Vector3();
  public rotationOffset: THREE.Quaternion = new THREE.Quaternion();

  constructor(bone: THREE.Bone) {
    this.bone = bone;
    this.boneStartRotation = bone.quaternion.clone();
    this.boneStartPosition = bone.position.clone();
  }
}
