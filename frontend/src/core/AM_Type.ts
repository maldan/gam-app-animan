export interface AM_IObjectInfo {
  uuid: string;
  name: string;
  category: string;
  modelPath: string;
  previewPath: string;
  position: AM_IVector3;
  rotation: AM_IVector4;
  scale: AM_IVector3;
}

export interface AM_IAudioInfo {
  uuid: string;
  name: string;
  category: string;
  audioPath: string;
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

export interface AM_IFrame {
  keys: {
    name: string;
    type: number;
    vBool: boolean;
    vFloat: number;
    vVector2: AM_IVector2;
    vVector3: AM_IVector3;
    vQuaternion: AM_IVector4;
  }[];
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
    objectUUID: string;
    animationList: { offset: number; animation: AM_IAnimation }[];
  }[];
}
