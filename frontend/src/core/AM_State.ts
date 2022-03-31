import { AM_Object } from '@/core/am/AM_Object';

export class AM_State {
  public static objectList: AM_Object[] = [];

  public static addObject(obj: AM_Object): void {
    this.objectList.push(obj);
  }
}
