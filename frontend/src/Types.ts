export interface Animation_Key {
  type: number;
  isAuto: boolean;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number; w: number };
  value: number;
}

export interface Animation_Event {
  name: string;
  frames: string;
}

export interface Animation_Frame {
  keys: Record<string, Animation_Key>;
}

export interface Animation_Sequence {
  frameId: number;
  frameCount: number;
  fps: number;
  isLoop: boolean;
}
