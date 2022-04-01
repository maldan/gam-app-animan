import { AM_Animation } from '@/core/animation/AM_Animation';
import { AM_Key } from '@/core/animation/key/AM_Key';

export interface AM_IAnimationPart {
  offset: number;
  animation: AM_Animation;
}

export class AM_AnimationController {
  public frameId = 0;
  public animationList: AM_IAnimationPart[] = [];

  public createAnimation(offset = 0): void {
    this.animationList.push({ offset, animation: new AM_Animation() });
  }

  public addAnimation(animation: AM_Animation, offset = 0): void {
    this.animationList.push({ offset, animation });
  }

  public get currentKeys(): AM_Key[] {
    return [];
  }
}
