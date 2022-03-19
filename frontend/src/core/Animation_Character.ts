import * as THREE from 'three';
import { Animation_Sequence } from '@/core/Animation_Sequence';
import { Animation_Rig } from '@/core/Animation_Rig';

export class Animation_Character {
  public animation?: Animation_Sequence;
  public name = '';
  private _shapeKeysName: string[] = [];
  private _shapeKeysValue: number[] = [];
  private _boneList: Record<string, THREE.Bone> = {};
  private _rigList: Animation_Rig[] = [];

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
      this._rigList.push(new Animation_Rig(object as THREE.Bone));
    });
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

  /*public get keyList(): string[] {
    return ['Root', 'Belly', 'Chest', 'Neck', 'Head'];
  }*/

  public get rigList(): Animation_Rig[] {
    return this._rigList;
  }
}
