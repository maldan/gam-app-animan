import * as THREE from 'three';
import { AM_Object } from '@/core/am/AM_Object';
import { AM_Bone } from '@/core/am/AM_Bone';
import { SkinnedMesh } from 'three';
import { AM_State } from '@/core/AM_State';
import { AM_Key } from '@/core/animation/key/AM_Key';
import { AM_IVector2, AM_IVector4 } from '@/core/AM_Type';

export class AM_Character extends AM_Object {
  public exposedKeys = [
    'transform.position',
    'transform.rotation',
    'transform.scale',
    'eye.L.position',
    'eye.R.position',
    'eye.L.scale',
    'eye.R.scale',
  ];

  private _boneList: Record<string, AM_Bone> = {};
  private _shapeList: { name: string; value: number }[] = [];
  private _shapeCache: Record<string, { mesh: THREE.SkinnedMesh; keyIndex: number }> = {};
  private _eyeL?: THREE.Mesh;
  private _eyeR?: THREE.Mesh;

  constructor(o: THREE.Object3D) {
    super(o);

    this.prepareEyes(o);
    this.prepareSkeleton(o);
    this.prepareShapes(o);
  }

  private prepareEyes(skeleton: THREE.Object3D): void {
    skeleton.traverse((object) => {
      if (object.name === 'EyeL' && object instanceof THREE.Mesh) {
        this._eyeL = object;
        object.material.map = object.material.map.clone();
      }
      if (object.name === 'EyeR' && object instanceof THREE.Mesh) {
        this._eyeR = object;
        object.material.map = object.material.map.clone();
      }
    });
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
      let size = 0.005;
      let length = size * 8;
      if (
        object.name.includes('Finger') ||
        object.name.includes('Toe') ||
        object.name.includes('Eye') ||
        object.name.includes('Nose') ||
        object.name.includes('Tongue')
      )
        size = 0.005;

      if (object.children.length) {
        // console.log(object.name, object.children);

        const gp1 = new THREE.Vector3();
        object.getWorldPosition(gp1);
        const gp2 = new THREE.Vector3();
        object.children[0].getWorldPosition(gp2);

        length = gp1.distanceTo(gp2);
      }

      // Offset geometry
      const geom = new THREE.BoxGeometry(size, length, size);
      const vertex = geom.attributes.position.array as Float32Array;
      for (let i = 0; i < vertex.length; i += 3) {
        vertex[i + 1] += length / 2;
      }

      // Create helper
      const boneHelper = new THREE.Mesh(
        geom,
        new THREE.MeshBasicMaterial({
          color: 0xfefefe,
          depthTest: false,
          opacity: 0.15,
          transparent: true,
        }),
      );
      boneHelper.visible = false;

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
    this.showBones();
    this.update();
  }

  public onUnselect(): void {
    this.hideBones();
  }

  public showBones(): void {
    for (const x in this.boneList) this.boneList[x].visible = true;
  }

  public hideBones(): void {
    for (const x in this.boneList) this.boneList[x].visible = false;
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
      if (this.boneList[boneName]) {
        this.boneList[boneName].rotationOffset = new THREE.Quaternion(k.x, k.y, k.z, k.w);
      }
    }

    if (prefix === 'shape') {
      const shapeName = key.name.split('.').slice(1).join('.');
      this.setShapeKey(shapeName, key.value as number);
    }

    if (prefix === 'eye') {
      const op = key.name.split('.')[2];
      if (op === 'position') this.setEyePosition(name, key.value as AM_IVector2);
      if (op === 'scale') this.setEyeScale(name, key.value as AM_IVector2);
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

  public setEyePosition(side: string, position: AM_IVector2): void {
    if (side === 'L' && this._eyeL) {
      // @ts-ignore
      this._eyeL.material.map.center.set(0.5, 0.5);
      // @ts-ignore
      this._eyeL.material.map.offset.set(-position.x, position.y);
    }
    if (side === 'R' && this._eyeR) {
      // @ts-ignore
      this._eyeR.material.map.center.set(0.5, 0.5);
      // @ts-ignore
      this._eyeR.material.map.offset.set(position.x, position.y);
    }
  }

  public setEyeScale(side: string, scale: AM_IVector2): void {
    if (side === 'L' && this._eyeL) {
      // @ts-ignore
      this._eyeL.material.map.center.set(0.5, 0.5);
      // @ts-ignore
      this._eyeL.material.map.repeat.set(1 + scale.x, 1 + scale.y);
    }
    if (side === 'R' && this._eyeL) {
      // @ts-ignore
      this._eyeR.material.map.center.set(0.5, 0.5);
      // @ts-ignore
      this._eyeR.material.map.repeat.set(1 + scale.x, 1 + scale.y);
    }
  }

  public getEyeData(side: string): { offset: AM_IVector2; scale: AM_IVector2 } {
    if (side === 'L' && this._eyeL)
      return {
        offset: {
          // @ts-ignore
          x: -this._eyeL.material.map.offset.x,
          // @ts-ignore
          y: this._eyeL.material.map.offset.y,
        },
        scale: {
          // @ts-ignore
          x: this._eyeL.material.map.repeat.x - 1,
          // @ts-ignore
          y: this._eyeL.material.map.repeat.y - 1,
        },
      };
    if (side === 'R' && this._eyeR)
      return {
        offset: {
          // @ts-ignore
          x: this._eyeR.material.map.offset.x,
          // @ts-ignore
          y: this._eyeR.material.map.offset.y,
        },
        scale: {
          // @ts-ignore
          x: this._eyeR.material.map.repeat.x - 1,
          // @ts-ignore
          y: this._eyeR.material.map.repeat.y - 1,
        },
      };
    return { offset: { x: 0, y: 0 }, scale: { x: 0, y: 0 } };
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
