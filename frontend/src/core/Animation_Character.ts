import * as THREE from 'three';
import { Animation_Sequence } from '@/core/Animation_Sequence';
import { Animation_Rig } from '@/core/Animation_Rig';
import { Animation_Key } from '@/core/Animation_Key';
import { Quaternion } from 'three';

export class Animation_Character {
  private _animation?: Animation_Sequence;
  public name = '';
  private _shapeKeysName: string[] = [];
  private _shapeKeysValue: number[] = [];
  private _boneList: Record<string, THREE.Bone> = {};
  private _rigList: Animation_Rig[] = [];
  private _rigDict: Record<string, Animation_Rig> = {};

  public init(name: string, obj: THREE.Group): void {
    this.name = name;
    obj.children.forEach((value, index) => {
      console.log(value);
      if (value.name === 'Skeleton') this.prepareSkeleton(value as THREE.Group);
      if (value.name === 'Character_Body_Futa') value.visible = false;
      if (value.name === 'Character_Head') {
        const sm = value as THREE.SkinnedMesh;
        this._shapeKeysName = Object.keys(sm.morphTargetDictionary as Record<string, number>);
        this._shapeKeysValue = sm.morphTargetInfluences || [];
      }
    });
  }

  private prepareSkeleton(skeleton: THREE.Group) {
    skeleton.traverse((object) => {
      // Skip anything except bone
      if (object.type !== 'Bone') return;

      // Save bone
      if (this._boneList[object.name]) return;
      this._boneList[object.name] = object as THREE.Bone;

      // Add rig
      const rig = new Animation_Rig(object as THREE.Bone);
      this._rigList.push(rig);
      this._rigDict[object.name] = rig;
    });
  }

  public setCurrentKey(keyName: string): void {
    if (!this.animation) return;

    const key = new Animation_Key();
    key.position = {
      x: this._rigDict[keyName].positionOffset.x,
      y: this._rigDict[keyName].positionOffset.y,
      z: this._rigDict[keyName].positionOffset.z,
    };
    key.rotation = {
      x: this._rigDict[keyName].rotationOffset.x,
      y: this._rigDict[keyName].rotationOffset.y,
      z: this._rigDict[keyName].rotationOffset.z,
      w: this._rigDict[keyName].rotationOffset.w,
    };
    this.animation.setKey(this.animation.frameId, keyName, key);
    this.animation.interpolateKey(keyName);
  }

  public tick(): void {
    this._rigList.forEach((rig) => {
      const newRotation = rig.boneStartRotation.clone().multiply(rig.rotationOffset);
      this._boneList[rig.bone.name].quaternion.set(
        newRotation.x,
        newRotation.y,
        newRotation.z,
        newRotation.w,
      );
    });
  }

  public get blendShapeNameList(): string[] {
    return this._shapeKeysName;
  }

  public get blendShapeValueList(): number[] {
    return this._shapeKeysValue;
  }

  public get rig(): Record<string, Animation_Rig> {
    return this._rigDict;
  }

  public get rigList(): Animation_Rig[] {
    return this._rigList;
  }

  public get animation(): Animation_Sequence | undefined {
    return this._animation;
  }

  public set animation(value: Animation_Sequence | undefined) {
    this._animation = value;
    if (this._animation)
      this._animation.on('change', () => {
        this._animation?.apply(this);
      });
  }
}
