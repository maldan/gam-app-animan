import { Animation_Key } from '@/core/Animation_Key';

export class Animation_Frame {
  public keys: Record<string, Animation_Key> = {};

  constructor(keys?: Record<string, Animation_Key>) {
    this.keys = keys || {};
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
