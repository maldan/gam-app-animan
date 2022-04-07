import Axios from 'axios';
import { AM_IAudioInfo, AM_IObjectInfo } from '@/core/am/AM_Object';

export class AM_API {
  public static API_URL = process.env.VUE_APP_API_URL || `${window.location.origin}/api`;
  public static ROOT_URL = process.env.VUE_APP_ROOT_URL || `${window.location.origin}`;

  public static async getObjectByUUID(uuid: string): Promise<AM_IObjectInfo> {
    const obj = (await Axios.get(`${this.API_URL}/repo/?uuid=${uuid}`)).data
      .response as AM_IObjectInfo;
    obj.modelPath = `${this.ROOT_URL}/` + obj.modelPath;
    if (obj.previewPath) obj.previewPath = `${this.ROOT_URL}/` + obj.previewPath;
    return obj;
  }

  public static async getObjectList(category: string): Promise<AM_IObjectInfo[]> {
    return (await Axios.get(`${this.API_URL}/repo/list?category=${category}`)).data.response.map(
      (x: AM_IObjectInfo) => {
        x.modelPath = `${this.ROOT_URL}/` + x.modelPath;
        if (x.previewPath) x.previewPath = `${this.ROOT_URL}/` + x.previewPath;
        return x;
      },
    );
  }

  public static async getCharacterList(): Promise<AM_IObjectInfo[]> {
    return (await Axios.get(`${this.API_URL}/repo/list?category=character`)).data.response.map(
      (x: AM_IObjectInfo) => {
        x.modelPath = `${this.ROOT_URL}/` + x.modelPath;
        if (x.previewPath) x.previewPath = `${this.ROOT_URL}/` + x.previewPath;
        return x;
      },
    );
  }

  public static async uploadAudio(name: string, category: string, file: File): Promise<void> {
    const form = new FormData();
    form.append('name', name);
    form.append('category', category);
    form.append('audio', file);

    await Axios.put(`${this.API_URL}/audio`, form);
  }

  public static async getAudioList(): Promise<AM_IAudioInfo[]> {
    return (await Axios.get(`${this.API_URL}/audio/list`)).data.response.map((x: AM_IAudioInfo) => {
      x.audioPath = `${this.ROOT_URL}/` + x.audioPath;
      return x;
    });
  }
}
