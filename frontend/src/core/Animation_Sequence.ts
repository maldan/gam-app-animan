import * as THREE from 'three';
import { Animation_Frame } from '@/core/Animation_Frame';
import { Animation_Key } from '@/core/Animation_Key';
import { Animation_Character } from '@/core/Animation_Character';

export class Animation_Sequence {
  private _frameId = 0;
  private _eventList: Record<string, ((...data: unknown[]) => void)[]> = {};

  public frameCount = 48;
  public fps = 24;
  public isLoop = false;
  public frames: Animation_Frame[] = [];

  constructor(args: { frameCount: number }) {
    this.frameCount = args.frameCount;
    for (let i = 0; i < this.frameCount; i++) {
      this.frames.push(new Animation_Frame());
    }
  }

  public apply(ch: Animation_Character): void {
    if (!this.frames[this._frameId]) return;

    for (const key in this.frames[this._frameId].keys) {
      const value = this.frames[this._frameId].keys[key];

      if (ch.rig[key]) {
        ch.rig[key].rotationOffset = new THREE.Quaternion(
          value.rotation.x,
          value.rotation.y,
          value.rotation.z,
          value.rotation.w,
        );
      }
    }
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

      /*Quaternion.Lerp(Frames[fromId].Keys[keyName].Rotation,
        Frames[toId].Keys[keyName].Rotation, (i + 1) * stepSize);*/
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

  public get frameId(): number {
    return this._frameId;
  }

  public set frameId(value: number) {
    this._frameId = value;
    this.emit('change', value);
  }
}
