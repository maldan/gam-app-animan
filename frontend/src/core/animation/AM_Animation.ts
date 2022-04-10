import { AM_Frame } from '@/core/animation/AM_Frame';
import { AM_Key } from '@/core/animation/key/AM_Key';
import { AM_AnimationController } from '@/core/animation/AM_AnimationController';

export class AM_Animation {
  // public frameCount = 48;
  public fps = 24;
  public isLoop = true;
  public frames: AM_Frame[] = [];
  public name = '';

  private _frameId = 0;
  private _frameCount = 48;
  private _eventList: Record<string, ((...data: unknown[]) => void)[]> = {};

  public controller?: AM_AnimationController;

  constructor() {
    for (let i = 0; i < this._frameCount; i++) {
      this.frames[i] = new AM_Frame();
    }
  }

  public interpolateKey(keyName: string): void {
    // Remove all auto keys
    for (let i = 0; i < this._frameCount; i++)
      if (this.frames[i].keys[keyName] != null && this.frames[i].keys[keyName].isAuto)
        delete this.frames[i].keys[keyName];

    let firstFrame = -1;
    for (let i = 0; i < this._frameCount; i++) {
      if (
        firstFrame == -1 &&
        this.frames[i].keys[keyName] &&
        !this.frames[i].keys[keyName].isAuto
      ) {
        firstFrame = i;
        continue;
      }

      if (firstFrame > -1 && this.frames[i].keys[keyName] && !this.frames[i].keys[keyName].isAuto) {
        const len = Math.abs(firstFrame - i);
        const newKeys = this.frames[firstFrame].keys[keyName].interpolate(
          this.frames[firstFrame].keys[keyName],
          this.frames[i].keys[keyName],
          len,
        );

        // Set new keys
        for (let j = 0; j < newKeys.length; j++)
          this.frames[j + firstFrame + 1].keys[keyName] = newKeys[j];

        firstFrame = i;
      }
    }
  }

  public get frameId(): number {
    return this._frameId;
  }

  public set frameId(value: number) {
    if (value <= 0) value = 0;
    if (value >= this._frameCount - 1) value = this._frameCount - 1;
    this._frameId = value;
    this.emit('change', value);
  }

  public get frameCount(): number {
    return this._frameCount;
  }

  public set frameCount(value: number) {
    if (value <= 1) value = 1;
    this._frameCount = value;

    this.frames.length = value;
    for (let i = 0; i < this._frameCount; i++) {
      if (!this.frames[i]) this.frames[i] = new AM_Frame();
    }
  }

  public get currentFrame(): AM_Frame {
    return this.frames[this._frameId];
  }

  public setCurrentKey(key: AM_Key): void {
    this.currentFrame.keys[key.name] = key;
    this.interpolateKey(key.name);
  }

  public on(eventName: string, fn: (...data: unknown[]) => void): void {
    if (!this._eventList[eventName]) this._eventList[eventName] = [];
    this._eventList[eventName].push(fn);
  }

  public off(eventName: string): void {
    if (this._eventList[eventName]) this._eventList[eventName].length = 0;
  }

  public emit(eventName: string, ...data: unknown[]): void {
    if (!this._eventList[eventName]) return;
    for (let i = 0; i < this._eventList[eventName].length; i++) {
      this._eventList[eventName][i](...data);
    }
  }
}
