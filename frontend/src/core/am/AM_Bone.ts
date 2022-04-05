import * as THREE from 'three';

export class AM_Bone {
  public bone!: THREE.Bone;
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
  }
}
