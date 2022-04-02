import { AM_Frame } from '@/core/animation/AM_Frame';
import { AM_Key } from '@/core/animation/key/AM_Key';

export class AM_Animation {
  public frameCount = 48;
  public fps = 24;
  public isLoop = true;
  public frames: AM_Frame[] = [];

  private _frameId = 0;
  private _eventList: Record<string, ((...data: unknown[]) => void)[]> = {};

  constructor() {
    for (let i = 0; i < this.frameCount; i++) {
      this.frames[i] = new AM_Frame();
    }
  }

  public get frameId(): number {
    return this._frameId;
  }

  public set frameId(value: number) {
    this._frameId = value;
    this.emit('change', value);
  }

  public get currentFrame(): AM_Frame {
    return this.frames[this._frameId];
  }

  public setCurrentKey(key: AM_Key): void {
    this.currentFrame.keys[key.name] = key;
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
}
