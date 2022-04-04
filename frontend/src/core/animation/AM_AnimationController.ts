import { AM_Animation } from '@/core/animation/AM_Animation';
import { AM_Key } from '@/core/animation/key/AM_Key';
import { AM_Frame } from '@/core/animation/AM_Frame';

export interface AM_IAnimationPart {
  offset: number;
  animation: AM_Animation;
}

export class AM_AnimationController {
  public animationList: AM_IAnimationPart[] = [];
  //public frames: AM_Frame[] = [];

  //public _frameId = 0;
  //private _frameCount = 0;
  private _eventList: Record<string, ((...data: unknown[]) => void)[]> = {};
  private _animation: AM_Animation = new AM_Animation();

  public createAnimation(offset = 0): void {
    this.animationList.push({ offset, animation: new AM_Animation() });
    this.compile();
  }

  public addAnimation(animation: AM_Animation, offset = 0): void {
    this.animationList.push({ offset, animation });
  }

  public compile(): void {
    this._animation.frames.length = 0;

    // Calculate total frames
    this._animation.frameCount = 0;
    for (let i = 0; i < this.animationList.length; i++) {
      this._animation.frameCount = Math.max(
        this._animation.frameCount,
        this.animationList[i].offset + this.animationList[i].animation.frameCount,
      );
    }

    // Fill frames
    for (let i = 0; i < this._animation.frameCount; i++) {
      this._animation.frames[i] = new AM_Frame();
    }

    // Fill keys
    for (let i = 0; i < this.animationList.length; i++) {
      const an = this.animationList[i];

      // Go over frames
      for (let j = 0; j < an.animation.frames.length; j++) {
        for (const key in an.animation.frames[j].keys) {
          // Clone key
          this._animation.frames[j + an.offset].keys[key] =
            an.animation.frames[j].keys[key].clone();
        }
      }
    }
  }

  public get frameId(): number {
    return this._animation.frameId;
  }

  public set frameId(value: number) {
    //if (value <= 0) value = 0;
    //if (value >= this.frameCount - 1) value = this.frameCount - 1;
    this._animation.frameId = value;
    this.emit('change', value);
  }

  public get animation(): AM_Animation {
    return this._animation;
  }

  public get currentFrame(): AM_Frame {
    return this._animation.currentFrame;
  }

  /*public get currentKeys(): Record<string, AM_Key> {
    return this.currentFrame.keys;
  }*/

  public get frameCount(): number {
    return this._animation.frameCount;
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