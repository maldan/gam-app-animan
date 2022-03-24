export interface IAnimation_Key {
  type: number;
  isAuto: boolean;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number; w: number };
  value: number;
}

export interface IAnimation_Event {
  name: string;
  frames: string;
}

export interface IAnimation_Frame {
  keys: Record<string, IAnimation_Key>;
}

export interface IAnimation_Sequence {
  frameId: number;
  frameCount: number;
  fps: number;
  isLoop: boolean;
}

export interface IVirtualObject {
  name: string;
  category: string;
  modelPath: string;
  previewPath: string;
}
