import * as THREE from 'three';
import { Animation_Frame } from '@/core/Animation_Frame';
import { Animation_Key } from '@/core/Animation_Key';
import { Animation_Character } from '@/core/Animation_Character';
import { MainScene } from '@/core/MainScene';

export class Animation_Sequence {
  private _frameId = 0;
  private _eventList: Record<string, ((...data: unknown[]) => void)[]> = {};

  public frameCount = 48;
  public fps = 24;
  public isLoop = true;
  public frames: Animation_Frame[] = [];

  constructor(args: {
    frameCount?: number;
    fps?: number;
    frames?: { keys: Record<string, any> }[];
  }) {
    this.frameCount = args.frameCount || 48;
    this.fps = args.fps || 24;

    if (args.frames) {
      const allKeys = {} as Record<string, unknown>;
      for (let i = 0; i < this.frameCount; i++) {
        this.frames.push(new Animation_Frame(args.frames[i].keys));

        for (const xx in args.frames[i].keys) {
          allKeys[xx] = 1;
        }
      }

      // Key
      for (const key in allKeys) this.interpolateKey(key);
    } else {
      for (let i = 0; i < this.frameCount; i++) {
        this.frames.push(new Animation_Frame());
      }
    }
  }

  public apply(ch: Animation_Character): void {
    if (!this.frames[this._frameId]) return;

    for (const key in this.frames[this._frameId].keys) {
      const currentKey = this.frames[this._frameId].keys[key];

      // Bone key
      if (currentKey.type === 0) {
        if (ch.rig[key]) {
          ch.rig[key].positionOffset = new THREE.Vector3(
            currentKey.position.x,
            currentKey.position.y,
            currentKey.position.z,
          );

          ch.rig[key].rotationOffset = new THREE.Quaternion(
            currentKey.rotation.x,
            currentKey.rotation.y,
            currentKey.rotation.z,
            currentKey.rotation.w,
          );

          ch.rig[key].scaleOffset = new THREE.Vector3(
            currentKey.scale.x,
            currentKey.scale.y,
            currentKey.scale.z,
          );
        }
      }

      // Shape key
      if (currentKey.type === 1) {
        ch.setBlendShape(key, currentKey.value);
      }
    }

    ch.tick();
  }

  public interpolateKey(keyName: string): void {
    // Remove all auto keys
    for (let i = 0; i < this.frameCount; i++)
      if (this.frames[i].keys[keyName] != null && this.frames[i].keys[keyName].isAuto)
        delete this.frames[i].keys[keyName];

    let firstFrame = -1;
    for (let i = 0; i < this.frameCount; i++) {
      if (
        firstFrame == -1 &&
        this.frames[i].keys[keyName] &&
        !this.frames[i].keys[keyName].isAuto
      ) {
        firstFrame = i;
        continue;
      }

      if (firstFrame > -1 && this.frames[i].keys[keyName] && !this.frames[i].keys[keyName].isAuto) {
        this.interpolateKeyBetween(keyName, firstFrame, i);
        firstFrame = i;
      }
    }
  }

  private interpolateKeyBetween(keyName: string, fromId: number, toId: number): void {
    const len = toId - fromId;
    if (len <= 1) return;
    const stepSize = 1 / len;
    for (let i = 0; i < len - 1; i++) {
      // Create key if not exists
      if (!this.frames[fromId + i + 1].keys[keyName])
        this.frames[fromId + i + 1].keys[keyName] = new Animation_Key();

      this.frames[fromId + i + 1].keys[keyName].type = this.frames[fromId].keys[keyName].type;
      this.frames[fromId + i + 1].keys[keyName].isAuto = true;

      // Lerp quaternion
      this.frames[fromId + i + 1].keys[keyName].rotation = new THREE.Quaternion(
        this.frames[fromId].keys[keyName].rotation.x,
        this.frames[fromId].keys[keyName].rotation.y,
        this.frames[fromId].keys[keyName].rotation.z,
        this.frames[fromId].keys[keyName].rotation.w,
      ).slerp(
        new THREE.Quaternion(
          this.frames[toId].keys[keyName].rotation.x,
          this.frames[toId].keys[keyName].rotation.y,
          this.frames[toId].keys[keyName].rotation.z,
          this.frames[toId].keys[keyName].rotation.w,
        ),
        (i + 1) * stepSize,
      );

      // Lerp position
      this.frames[fromId + i + 1].keys[keyName].position = new THREE.Vector3(
        this.frames[fromId].keys[keyName].position.x,
        this.frames[fromId].keys[keyName].position.y,
        this.frames[fromId].keys[keyName].position.z,
      ).lerp(
        new THREE.Vector3(
          this.frames[toId].keys[keyName].position.x,
          this.frames[toId].keys[keyName].position.y,
          this.frames[toId].keys[keyName].position.z,
        ),
        (i + 1) * stepSize,
      );

      // Lerp scale
      this.frames[fromId + i + 1].keys[keyName].scale = new THREE.Vector3(
        this.frames[fromId].keys[keyName].scale.x,
        this.frames[fromId].keys[keyName].scale.y,
        this.frames[fromId].keys[keyName].scale.z,
      ).lerp(
        new THREE.Vector3(
          this.frames[toId].keys[keyName].scale.x,
          this.frames[toId].keys[keyName].scale.y,
          this.frames[toId].keys[keyName].scale.z,
        ),
        (i + 1) * stepSize,
      );

      // Lerp value
      this.frames[fromId + i + 1].keys[keyName].value =
        this.frames[fromId].keys[keyName].value +
        (this.frames[toId].keys[keyName].value - this.frames[fromId].keys[keyName].value) *
          ((i + 1) * stepSize);
    }
  }

  public setKey(frameId: number, keyName: string, key: Animation_Key): void {
    key.isAuto = false;

    // Create frame
    if (!this.frames[frameId]) this.frames[frameId] = new Animation_Frame();

    this.frames[frameId].keys[keyName] = key;
  }

  public on(eventName: string, fn: (...data: unknown[]) => void): void {
    if (!this._eventList[eventName]) this._eventList[eventName] = [];
    this._eventList[eventName].push(fn);
  }

  public emit(eventName: string, ...data: unknown[]): void {
    if (!this._eventList[eventName]) return;
    for (let i = 0; i < this._eventList[eventName].length; i++) {
      this._eventList[eventName][i](...data);
    }
  }

  public tick(): void {
    const calculatedFrame = Math.floor(MainScene.timelineTimer * this.fps) % this.frameCount;
    let isUpdate = false;

    /*if (calculatedFrame > this.frameCount) {
      if (this.isLoop) {
        isUpdate = true;
        calculatedFrame = 0;
      }
    }*/

    if (calculatedFrame != this._frameId) isUpdate = true;
    this.frameId = calculatedFrame;

    if (isUpdate) {
      //Apply(character);
      //ResolveEvents(calculatedFrame);
    }
  }

  public resize(value: number): void {
    this.frames.length = value;
    this.frameCount = value;
    for (let i = 0; i < value; i++) {
      if (!this.frames[i]) this.frames[i] = new Animation_Frame();
    }
  }

  public get currentFrame(): Animation_Frame {
    return this.frames[this._frameId];
  }

  public get frameId(): number {
    return this._frameId;
  }

  public set frameId(value: number) {
    if (value <= 0) value = 0;
    if (value > this.frameCount - 1) value = 0;
    this._frameId = value;
    this.emit('change', value);
  }

  public toJSON(): unknown {
    return {
      version: 1,
      frameCount: this.frameCount,
      fps: this.fps,
      frames: this.frames,
    };
  }
}
