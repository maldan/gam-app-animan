import * as THREE from 'three';
import { Animation_Sequence } from '@/core/Animation_Sequence';
import { Animation_Rig } from '@/core/Animation_Rig';
import { Animation_Key } from '@/core/Animation_Key';
import { Quaternion } from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { MainScene } from '@/core/MainScene';

export class Animation_Character {
  private _animation?: Animation_Sequence;
  public name = '';
  private _shapeKeysName: string[] = [];
  private _shapeKeysValue: number[] = [];
  private _boneList: Record<string, THREE.Bone> = {};
  private _rigList: Animation_Rig[] = [];
  private _rigDict: Record<string, Animation_Rig> = {};
  private _scene!: THREE.Scene;
  private _obj!: THREE.Object3D;

  public init(name: string, obj: THREE.Group, scene: THREE.Scene): void {
    this.name = name;
    this._scene = scene;
    this._obj = obj;
    obj.children.forEach((value, index) => {
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

      // Create bone helper
      const boneHelper = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, 0.02, 0.04),
        new THREE.MeshBasicMaterial({
          color: 0xfefefe,
          depthTest: false,
          opacity: 0.5,
          transparent: true,
        }),
      );

      // Add rig
      const rig = new Animation_Rig(object as THREE.Bone, boneHelper);
      this._rigList.push(rig);
      this._rigDict[object.name] = rig;

      // Add bone helper
      boneHelper.name = 'BoneHelper';
      boneHelper.userData.tag = 'BoneHelper';
      boneHelper.userData.rig = rig;
      boneHelper.userData.character = this;
      this._scene.add(boneHelper);
    });

    this.tick();
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
      const newPosition = rig.boneStartPosition.clone().add(rig.positionOffset);
      this._boneList[rig.bone.name].position.set(newPosition.x, newPosition.y, newPosition.z);

      const newRotation = rig.boneStartRotation.clone().multiply(rig.rotationOffset);
      this._boneList[rig.bone.name].quaternion.set(
        newRotation.x,
        newRotation.y,
        newRotation.z,
        newRotation.w,
      );

      rig.tick();
    });
  }

  public onSelect(): void {
    this._rigList.forEach((rig) => {
      rig.boneHelper.visible = true;
    });
  }

  public onUnselect(): void {
    this._rigList.forEach((rig) => {
      rig.boneHelper.visible = false;
    });
  }

  public setKeysVisibility(keys: string[]): void {
    this._rigList.forEach((rig) => {
      rig.boneHelper.visible = false;
    });

    this._rigList.forEach((rig) => {
      rig.boneHelper.visible = keys.includes(rig.bone.name);
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
        MainScene.ui.timeline.refresh();
      });
  }
}
