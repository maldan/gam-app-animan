import { Animation_Key } from '@/core/animation/Animation_Key';

export class Animation_Frame {
  public keys: Record<string, Animation_Key> = {};

  constructor(keys?: Record<string, Animation_Key>) {
    if (keys) {
      for (const key in keys) {
        if (keys[key] instanceof Animation_Key) this.keys[key] = keys[key];
        else this.keys[key] = new Animation_Key(keys[key]);
      }
    } else {
      this.keys = {};
    }
  }

  public toJSON(): Record<string, unknown> {
    const keys = {} as Record<string, unknown>;

    for (const key in this.keys) {
      if (this.keys[key].isAuto) continue;
      keys[key] = this.keys[key];
    }

    return {
      keys,
    };
  }
}
