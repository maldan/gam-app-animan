import * as THREE from 'three';
import { AM_Object } from '@/core/am/AM_Object';
import { AM_Character } from '@/core/am/AM_Character';
import { AM_IVector3, AM_IVector4 } from '@/core/AM_Type';

export class AM_Bone extends AM_Object {
  public bone!: THREE.Bone;

  public startPosition: THREE.Vector3 = new THREE.Vector3();
  public startRotation: THREE.Quaternion = new THREE.Quaternion();
  public startScale: THREE.Vector3 = new THREE.Vector3();

  /*public positionOffset: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  public rotationOffset: THREE.Quaternion = new THREE.Quaternion();
  public scaleOffset: THREE.Vector3 = new THREE.Vector3();*/

  /*public bonePosition: THREE.Vector3 = new THREE.Vector3();
  public boneScale: THREE.Vector3 = new THREE.Vector3();
  public boneRotation: THREE.Quaternion = new THREE.Quaternion();*/

  public parent!: AM_Object;

  constructor(o: THREE.Mesh, parent: AM_Object, bone: THREE.Bone) {
    super(o);

    this.bone = bone;
    this.parent = parent;

    this.startRotation = bone.quaternion.clone();
    this.startPosition = bone.position.clone();
    this.startScale = bone.scale.clone();

    /*this.bonePosition = bone.position.clone();
    this.boneRotation = bone.quaternion.clone();
    this.boneScale = bone.scale.clone();*/
  }

  public update(): void {
    // this.bone.position.set();

    const pp = new THREE.Vector3();
    this.bone.localToWorld(pp);
    this.position = {
      x: pp.x,
      y: pp.y,
      z: pp.z,
    };

    const qq = new THREE.Quaternion();
    this.bone.getWorldQuaternion(qq);
    this.rotation = {
      x: qq.x,
      y: qq.y,
      z: qq.z,
      w: qq.w,
    };

    // Set bone rotation
    /*this.bone.setRotationFromQuaternion(this.startRotation.clone().multiply(this.rotationOffset));
    const gr = new THREE.Quaternion();
    this.bone.getWorldQuaternion(gr);
    this.rotation = { x: gr.x, y: gr.y, z: gr.z, w: gr.w };

    // Set bone position
    const offset = this.positionOffset.clone();
    // offset.applyQuaternion(this.bone.quaternion);
    const gg = new THREE.Quaternion();
    this.bone.getWorldQuaternion(gg);
    offset.applyQuaternion(gg);

    this.bone.position
      .set(this.startPosition.x, this.startPosition.y, this.startPosition.z)
      .add(offset);
    const gp = new THREE.Vector3();
    this.bone.getWorldPosition(gp);
    this.position = { x: gp.x, y: gp.y, z: gp.z };*/

    /*// Set bone scale
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

     this.scale = { x: gs.x, y: gs.y, z: gs.z };*/

    if (this.bone.name === 'Head_1') {
      // console.log(this.startPosition, this.positionOffset, this.bone.position);
      /*const rr = new THREE.Euler().setFromQuaternion(
        new THREE.Quaternion(this.rotation.x, this.rotation.y, this.rotation.z, this.rotation.w),
      );
      const rr2 = new THREE.Euler().setFromQuaternion(this.bone.quaternion);
      console.log(
        'r',
        MathUtils.radToDeg(rr.x),
        MathUtils.radToDeg(rr.y),
        MathUtils.radToDeg(rr.z),
      );
      console.log(
        'r2',
        MathUtils.radToDeg(rr2.x),
        MathUtils.radToDeg(rr2.y),
        MathUtils.radToDeg(rr2.z),
      );*/
    }
  }

  public onSelect(): void {
    super.onSelect();

    // @ts-ignore
    this.model.material.color.set(0x00ff00);

    // @ts-ignore
    this.model.material.opacity = 0.7;

    this.visible = true;

    if (this.parent instanceof AM_Character) {
      this.parent.showBones();
    }
  }

  public onUnselect(): void {
    super.onUnselect();

    // @ts-ignore
    this.model.material.color.set(0xffffff);
    // @ts-ignore
    this.model.material.opacity = 0.15;

    if (this.parent instanceof AM_Character) {
      this.parent.hideBones();
    }
  }

  public mirrorFromBone(fromBone: AM_Bone): void {
    const off = fromBone.rotationOffset;
    const r = new THREE.Quaternion(off.x, off.y, off.z, off.w);
    const e = new THREE.Euler().setFromQuaternion(r);
    e.y *= -1;
    e.z *= -1;
    const nr = new THREE.Quaternion().setFromEuler(e);

    this.rotationOffset = { x: nr.x, y: nr.y, z: nr.z, w: nr.w };

    this.update();
    this.parent.update();
  }

  public get positionOffset(): AM_IVector3 {
    const diff = this.bone.position.clone().sub(this.startPosition);
    return { x: diff.x, y: diff.y, z: diff.z };
  }

  public set positionOffset(v: AM_IVector3) {
    // Set bone rotation
    const q = this.startPosition.clone().add(new THREE.Vector3(v.x, v.y, v.z));
    this.bone.position.set(q.x, q.y, q.z);

    // Set visual bone rotation
    /*const pp = new THREE.Vector3();
    this.bone.localToWorld(pp);
    this.position = {
      x: pp.x,
      y: pp.y,
      z: pp.z,
    };*/
  }

  public get rotationOffset(): AM_IVector4 {
    const diff = this.bone.quaternion.clone().invert().multiply(this.startRotation);
    return { x: diff.x, y: diff.y, z: diff.z, w: diff.w };
  }

  public set rotationOffset(v: AM_IVector4) {
    // Set bone rotation
    const q = this.startRotation
      .clone()
      .multiply(new THREE.Quaternion(v.x, v.y, v.z, v.w).invert());
    this.bone.quaternion.set(q.x, q.y, q.z, q.w);

    // Set visual bone rotation
    /*const qq = new THREE.Quaternion();
    this.bone.getWorldQuaternion(qq);
    this.rotation = {
      x: qq.x,
      y: qq.y,
      z: qq.z,
      w: qq.w,
    };*/
  }

  public get scaleOffset(): AM_IVector3 {
    const diff = this.bone.scale.clone().sub(this.startScale);
    return { x: diff.x, y: diff.y, z: diff.z };
  }

  public set scaleOffset(v: AM_IVector3) {
    // Set bone rotation
    const q = this.startScale.clone().add(new THREE.Vector3(v.x, v.y, v.z));
    this.bone.scale.set(q.x, q.y, q.z);

    // Set visual bone rotation
    /*const pp = new THREE.Vector3();
    this.bone.localToWorld(pp);
    this.scale = {
      x: pp.x,
      y: pp.y,
      z: pp.z,
    };*/
  }

  public reset(): void {
    this.positionOffset = { x: 0, y: 0, z: 0 };
    this.rotationOffset = { x: 0, y: 0, z: 0, w: 1 };
    this.scaleOffset = { x: 0, y: 0, z: 0 };
  }

  public get isRotationChanged(): boolean {
    const off = this.rotationOffset;
    if (off.x != 0) return true;
    if (off.y != 0) return true;
    if (off.z != 0) return true;
    if (Number(off.w.toFixed(5)) != 1) return true;
    return false;
  }

  public get isPositionChanged(): boolean {
    const off = this.positionOffset;
    if (off.x != 0) return true;
    if (off.y != 0) return true;
    if (off.z != 0) return true;
    return false;
  }
}
