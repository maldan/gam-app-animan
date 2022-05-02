import * as THREE from 'three';
import { AM_IResourceInfo } from '@/core/AM_Type';
import { Audio } from 'three';
import { AM_Core } from '@/core/AM_Core';

export class AM_Audio {
  public widthInFrames = 4;
  public name = '';
  public url = '';
  public audio!: Audio;
  // public isPlay = false;

  constructor(info: AM_IResourceInfo) {
    this.url = info.filePath;
    this.name = info.name;

    this.audio = new THREE.Audio(AM_Core.audioListener);
    /*this.audio.so.onEnded = () => {
      this.isPlay = false;
    };*/

    const audioLoader = new THREE.AudioLoader();
    audioLoader.load(info.filePath, (buffer) => {
      this.audio.setBuffer(buffer);
      this.widthInFrames = Math.ceil(buffer.duration * 24);
    });
  }

  public play(): void {
    if (this.audio.isPlaying) return;
    this.audio.play();
  }
}
