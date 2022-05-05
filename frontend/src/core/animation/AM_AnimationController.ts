import { AM_Animation } from '@/core/animation/AM_Animation';
import { AM_Frame } from '@/core/animation/AM_Frame';
import { AM_Audio } from '@/core/AM_Audio';
import { AM_IResourceInfo } from '@/core/AM_Type';

export interface AM_IAnimationPart {
  offset: number;
  repeat: number;
  animation: AM_Animation;
}

export interface AM_IAudioPart {
  offset: number;
  repeat: number;
  volume: number;
  audio: AM_Audio;
}

export class AM_AnimationController {
  public animationList: AM_IAnimationPart[] = [];
  public audioList: AM_IAudioPart[] = [];
  private _eventList: Record<string, ((...data: unknown[]) => void)[]> = {};
  private _animation: AM_Animation = new AM_Animation();

  public selectedAudioPart: AM_IAudioPart | undefined;
  public selectedAnimationPart: AM_IAnimationPart | undefined;
  public workingOnAnimationPart: AM_IAnimationPart | undefined;

  public appendAudio(info: AM_IResourceInfo, offset = 0, repeat = 1, volume = 1): void {
    const audio = new AM_Audio(info);
    audio.volume = volume;
    this.audioList.push({
      offset,
      repeat,
      volume,
      audio,
    });
  }

  public createAnimation(offset = 0): void {
    const animation = new AM_Animation();
    animation.controller = this;
    this.animationList.push({ offset, repeat: 1, animation });
    this.compile();
  }

  public appendAnimation(animation: AM_Animation, offset = 0, repeat = 1): void {
    animation.controller = this;
    this.animationList.push({ offset, repeat, animation });
    this.compile();
  }

  public getAnimationOffset(animation: AM_Animation): number {
    const anm = this.animationList.find((x) => x.animation === animation);
    return anm?.offset ?? 0;
  }

  public deleteAnimationPart(part: AM_IAnimationPart): void {
    const index = this.animationList.indexOf(part);
    if (index !== -1) this.animationList.splice(index, 1);
    this.compile();
  }

  public deleteAudioPart(part: AM_IAudioPart): void {
    const index = this.audioList.indexOf(part);
    if (index !== -1) this.audioList.splice(index, 1);
  }

  public playAudio(): void {
    for (let i = 0; i < this.audioList.length; i++) {
      if (
        this.frameId > this.audioList[i].offset &&
        this.frameId < this.audioList[i].offset + this.audioList[i].audio.widthInFrames
      ) {
        this.audioList[i].audio.volume = this.audioList[i].volume;
        this.audioList[i].audio.play();
      }
    }
  }

  public stopAudio(): void {
    for (let i = 0; i < this.audioList.length; i++) {
      this.audioList[i].audio.stop();
    }
  }

  public compile(): void {
    this._animation.frames.length = 0;

    // Calculate total frames
    this._animation.frameCount = 0;
    for (let i = 0; i < this.animationList.length; i++) {
      this._animation.frameCount = Math.max(
        this._animation.frameCount,
        this.animationList[i].offset +
          this.animationList[i].animation.frameCount * this.animationList[i].repeat,
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
      const anFrames = an.animation.frames.length;
      for (let j = 0; j < anFrames * an.repeat; j++) {
        for (const key in an.animation.frames[j % anFrames].keys) {
          // Clone key
          this._animation.frames[j + an.offset].keys[key] =
            an.animation.frames[j % anFrames].keys[key].clone();
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
    const changed = this._animation.frameId != value;
    this._animation.frameId = value;
    if (changed) {
      //if (AM_State.isAnimationPlay) {
      // this.audioList.forEach((x) => x.audio.play());
      //}
      this.emit('change', value);
    }
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
