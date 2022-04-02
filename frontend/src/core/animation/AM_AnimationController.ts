import { AM_Animation } from '@/core/animation/AM_Animation';
import { AM_Key } from '@/core/animation/key/AM_Key';

export interface AM_IAnimationPart {
  offset: number;
  animation: AM_Animation;
}

export class AM_AnimationController {
  public frameId = 0;
  public animationList: AM_IAnimationPart[] = [];

  private _eventList: Record<string, ((...data: unknown[]) => void)[]> = {};

  public createAnimation(offset = 0): void {
    this.animationList.push({ offset, animation: new AM_Animation() });
  }

  public addAnimation(animation: AM_Animation, offset = 0): void {
    this.animationList.push({ offset, animation });
  }

  public get currentKeys(): Record<string, AM_Key> {
    return this.animationList[0].animation.currentFrame.keys;
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
