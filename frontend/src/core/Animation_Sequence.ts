import { Animation_Frame } from '@/core/Animation_Frame';

export class Animation_Sequence {
  public frameId = 0;
  public frameCount = 0;
  public fps = 24;
  public isLoop = false;

  public frames: Animation_Frame[] = [];
}
