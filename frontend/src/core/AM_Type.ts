export interface AM_IObjectInfo {
  uuid: string;
  name: string;
  category: string;
  modelPath: string;
  previewPath: string;
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
