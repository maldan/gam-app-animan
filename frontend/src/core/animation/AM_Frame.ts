import { AM_Key } from '@/core/animation/key/AM_Key';

export class AM_Frame {
  public keys: Record<string, AM_Key> = {};

  public clone(): AM_Frame {
    const frame = new AM_Frame();

    for (const x in this.keys) {
      frame.keys[this.keys[x].name] = this.keys[x].clone();
    }

    return frame;
  }
}
