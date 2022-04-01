import Axios from 'axios';
import { AM_IObjectInfo } from '@/core/am/AM_Object';

export class AM_API {
  public static API_URL = process.env.VUE_APP_API_URL || `${window.location.origin}/api`;
  public static ROOT_URL = process.env.VUE_APP_ROOT_URL || `${window.location.origin}`;

  public static async getCharacterList(): Promise<AM_IObjectInfo[]> {
    return (await Axios.get(`${this.API_URL}/object/list?category=character`)).data.response.map(
      (x: AM_IObjectInfo) => {
        x.modelPath = `${this.ROOT_URL}/` + x.modelPath;
        if (x.previewPath) x.previewPath = `${this.ROOT_URL}/` + x.previewPath;
        return x;
      },
    );
  }
}
