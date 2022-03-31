import { AM_Frame } from '@/core/animation/AM_Frame';

export class AM_Animation {
  private _frameId = 0;

  public frameCount = 48;
  public fps = 24;
  public isLoop = true;
  public frames: AM_Frame[] = [];

  public get currentFrame(): AM_Frame {
    return this.frames[this._frameId];
  }
}
