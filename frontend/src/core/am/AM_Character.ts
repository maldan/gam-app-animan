import * as THREE from 'three';
import { AM_Object } from '@/core/am/AM_Object';
import { AM_Core } from '@/core/AM_Core';
import { AM_Bone } from '@/core/am/AM_Bone';
import { SkinnedMesh } from 'three';
import { AM_State } from '@/core/AM_State';
import { AM_Key } from '@/core/animation/key/AM_Key';
import { AM_IVector4 } from '@/core/AM_Type';

export class AM_Character extends AM_Object {
  public exposedKeys = ['transform.position', 'transform.rotation', 'transform.scale'];

  private _boneList: Record<string, AM_Bone> = {};
  private _shapeList: { name: string; value: number }[] = [];
  private _shapeCache: Record<string, { mesh: THREE.SkinnedMesh; keyIndex: number }> = {};

  constructor(o: THREE.Object3D) {
    super(o);

    this.prepareSkeleton(o);
    this.prepareShapes(o);
  }

  private prepareShapes(skeleton: THREE.Object3D) {
    skeleton.traverse((object) => {
      // Skip anything except bone
      if (object.type !== 'SkinnedMesh') return;
      if (object instanceof SkinnedMesh) {
        for (const k in object.morphTargetDictionary) {
          this.exposedKeys.push(`shape.${object.name}.${k}`);
          this._shapeList.push({
            name: `${object.name}.${k}`,
            value: object.morphTargetInfluences?.[object.morphTargetDictionary[k]] || 0,
          });
          this._shapeCache[`${object.name}.${k}`] = {
            mesh: object,
            keyIndex: object.morphTargetDictionary[k],
          };
        }
      }
    });
  }

  private prepareSkeleton(skeleton: THREE.Object3D) {
    skeleton.traverse((object) => {
      // Skip anything except bone
      if (object.type !== 'Bone') return;

      // Change name
      if (object.name.match(/([LR])$/)) {
        object.name = object.name.replace(/(.*?)([LR])$/, '$1.$2');
      }

      // Skip if exists
      if (this._boneList[object.name]) return;

      // Adjust bine size
      let size = 0.01;
      if (
        object.name.includes('Finger') ||
        object.name.includes('Toe') ||
        object.name.includes('Eye') ||
        object.name.includes('Nose') ||
        object.name.includes('Tongue')
      )
        size = 0.005;

      // Create helper
      const boneHelper = new THREE.Mesh(
        new THREE.BoxGeometry(size, size * 8, size),
        new THREE.MeshBasicMaterial({
          color: 0xfefefe,
          depthTest: false,
          opacity: 0.15,
          transparent: true,
        }),
      );

      // Create bone
      this._boneList[object.name] = new AM_Bone(boneHelper, this, object as THREE.Bone);
      this._boneList[object.name].name = object.name;
      this._boneList[object.name].update();

      // Add helper to scene
      AM_State.addObject(this._boneList[object.name]);

      this.exposedKeys.push(`bone.${object.name}.position`);
      this.exposedKeys.push(`bone.${object.name}.rotation`);
      this.exposedKeys.push(`bone.${object.name}.scale`);
    });
  }

  public onSelect(): void {
    /*if (AM_State.selectedObject === this) {
      for (const x in this.boneList)
        this.boneList[x].boneHelper.visible = AM_State.interactionMode === 'pose';

      if (AM_State.interactionMode === 'object') AM_Core.setManipulatorTo(this);
    }*/
    this.update();
  }

  public onUnselect(): void {
    // for (const x in this.boneList) this.boneList[x].visible = false;
  }

  public applyKey(key: AM_Key): void {
    const prefix = key.name.split('.')[0];
    const name = key.name.split('.')[1];

    if (prefix === 'transform') {
      // @ts-ignore
      this[name] = key.value;
    }

    if (prefix === 'bone') {
      const boneName = key.name.split('.').slice(1, -1).join('.');
      const k = key.value as AM_IVector4;
      this.boneList[boneName].rotationOffset = new THREE.Quaternion(k.x, k.y, k.z, k.w);
    }

    if (prefix === 'shape') {
      const shapeName = key.name.split('.').slice(1).join('.');
      this.setShapeKey(shapeName, key.value as number);
    }
  }

  public setShapeKey(name: string, value: number): void {
    const shapeIndex = this._shapeList.findIndex((x) => x.name === name);
    if (shapeIndex !== -1) {
      this._shapeList[shapeIndex].name = name;
      this._shapeList[shapeIndex].value = value;

      if (this._shapeCache[name].mesh.morphTargetInfluences) {
        // @ts-ignore
        this._shapeCache[name].mesh.morphTargetInfluences[this._shapeCache[name].keyIndex] = value;
      }
    }
  }

  public get shapeList(): { name: string; value: number }[] {
    return this._shapeList;
  }

  public update(): void {
    for (const x in this.boneList) {
      // this.boneList[x].boneHelper.visible = this.visible;
      this.boneList[x].update();
    }
  }

  public resetPose(): void {
    for (const x in this.boneList) {
      this.boneList[x].reset();
    }
  }

  public get boneList(): Record<string, AM_Bone> {
    return this._boneList;
  }

  public set visible(status: boolean) {
    this.model.visible = status;
    for (const x in this.boneList) {
      this.boneList[x].visible = status;
    }
  }

  public get visible(): boolean {
    return this.model.visible;
  }

  public destroy(): void {
    super.destroy();

    for (const x in this.boneList) {
      this.boneList[x].destroy();
    }
  }
}
