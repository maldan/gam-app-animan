import { AM_Object } from '@/core/am/AM_Object';

export class AM_Character extends AM_Object {
  public exposedKeys = ['bone.Root.position', 'bone.Root.rotation', 'bone.Root.scale'];
}
