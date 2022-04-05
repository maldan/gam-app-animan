import * as THREE from 'three';
import { AM_Object } from '@/core/am/AM_Object';
import { AM_Core } from '@/core/AM_Core';
import { AM_Bone } from '@/core/am/AM_Bone';

export class AM_Character extends AM_Object {
  public exposedKeys = [
    'transform.position',
    'transform.rotation',
    'transform.scale',
    'bone.Root.position',
    'bone.Root.rotation',
    'bone.Root.scale',
  ];

  private _boneList: Record<string, AM_Bone> = {};

  constructor(o: THREE.Object3D) {
    super(o);

    this.prepareSkeleton(o);
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
        size = 0.007;

      // Create helper
      const boneHelper = new THREE.Mesh(
        new THREE.BoxGeometry(size, size * 8, size),
        new THREE.MeshBasicMaterial({
          color: 0xfefefe,
          depthTest: false,
          opacity: 0.3,
          transparent: true,
        }),
      );

      // Create bone
      this._boneList[object.name] = new AM_Bone(object as THREE.Bone, boneHelper);
      this._boneList[object.name].tick();

      // Add helper to scene
      AM_Core.scene.add(boneHelper);

      // Add rig
      /*const rig = new Animation_Rig(object as THREE.Bone, boneHelper);
      this._rigList.push(rig);
      this._rigDict[object.name] = rig;

      // Add bone helper
      boneHelper.name = 'BoneHelper';
      boneHelper.userData.tag = 'BoneHelper';
      boneHelper.userData.rig = rig;
      boneHelper.userData.character = this;
      boneHelper.visible = false;
      this._scene.add(boneHelper);*/
    });

    // this.tick();
  }

  public update(): void {
    for (const x in this.boneList) {
      this.boneList[x].tick();
    }
  }

  public get boneList(): Record<string, AM_Bone> {
    return this._boneList;
  }

  public destroy(): void {
    super.destroy();
  }
}
