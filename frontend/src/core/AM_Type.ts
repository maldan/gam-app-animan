import { AM_Key } from '@/core/animation/key/AM_Key';
import { AM_KeyFloat } from '@/core/animation/key/AM_KeyFloat';
import { AM_KeyVector3 } from '@/core/animation/key/AM_KeyVector3';
import { AM_KeyQuaternion } from '@/core/animation/key/AM_KeyQuaternion';

export interface AM_IObjectInfo {
  id: string;
  resourceId: string;
  name: string;
  category: string;
  filePath: string;
  previewPath: string;
  position: AM_IVector3;
  rotation: AM_IVector4;
  scale: AM_IVector3;
}

/*
export interface AM_IAudioInfo {
  resourceId: string;
  name: string;
  category: string;
  audioPath: string;
}

export interface AM_IClipInfo {
  resourceId: string;
  name: string;
  category: string;
  clipPath: string;
}

export interface AM_IAnimationInfo {
  resourceId: string;
  name: string;
  category: string;
  filePath: string;
}*/

export interface AM_IResourceInfo {
  resourceId: string;
  name: string;
  category: string;
  filePath: string;
}

export interface AM_IVector2 {
  x: number;
  y: number;
}

export interface AM_IVector3 {
  x: number;
  y: number;
  z: number;
}

export interface AM_IVector4 {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface AM_IKey {
  name: string;
  type: number;
  vBool: boolean;
  vFloat: number;
  vVector2: AM_IVector2;
  vVector3: AM_IVector3;
  vQuaternion: AM_IVector4;
}

export interface AM_IFrame {
  keys: AM_IKey[];
}

export interface AM_IAnimation {
  fps: number;
  frameCount: number;
  name: string;
  version: number;
  frames: AM_IFrame[];
}

export interface AM_IClip {
  name: string;
  objectList: AM_IObjectInfo[];
  animationList: {
    objectId: string;
    animationList: { offset: number; animation: AM_IAnimation }[];
  }[];
  audioList: {
    objectId: string;
    resourceId: string;
    offset: number;
    repeat: number;
  }[];
}

export interface AM_IPose {
  keys: AM_IKey[];
}

export class AM_KeyHelper {
  public static fromJSON(data: AM_IKey): AM_Key {
    if (data.type == 1) return new AM_KeyFloat(data.name, data.vFloat);
    if (data.type == 3) return new AM_KeyVector3(data.name, data.vVector3);
    if (data.type == 4) return new AM_KeyQuaternion(data.name, data.vQuaternion);
    return new AM_Key();
  }
}
