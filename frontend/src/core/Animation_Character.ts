import { Animation_Sequence } from '@/core/Animation_Sequence';
import * as THREE from 'three';
import { Bone } from 'three';

export class Animation_Character {
  public animation?: Animation_Sequence;
  public name = '';
  private _shapeKeysName: string[] = [];
  private _shapeKeysValue: number[] = [];
  private _boneList: THREE.Bone[] = [];

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
    this._boneList.length = 0;

    skeleton.traverse((object) => {
      if (object.type !== 'Bone') return;

      // Already have that bone
      if (this._boneList.find((x: THREE.Bone) => x.name === object.name)) return;
      this._boneList.push(object as THREE.Bone);
    });
  }

  public get blendShapeNameList(): string[] {
    return this._shapeKeysName;
  }

  public get blendShapeValueList(): number[] {
    return this._shapeKeysValue;
  }

  public get boneList(): THREE.Bone[] {
    return this._boneList;
  }

  public get keyList(): string[] {
    return ['Root', 'Belly', 'Chest', 'Neck', 'Head'];
  }
}
