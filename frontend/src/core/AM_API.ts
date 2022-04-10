import Axios from 'axios';
import { AM_Object } from '@/core/am/AM_Object';
import { AM_Animation } from '@/core/animation/AM_Animation';
import { AM_KeyFloat } from '@/core/animation/key/AM_KeyFloat';
import { AM_KeyVector3 } from '@/core/animation/key/AM_KeyVector3';
import { AM_KeyQuaternion } from '@/core/animation/key/AM_KeyQuaternion';
import {
  AM_IAnimation,
  AM_IAudioInfo,
  AM_IClip,
  AM_IObjectInfo,
  AM_IVector3,
  AM_IVector4,
} from '@/core/AM_Type';

export class AM_API {
  public static API_URL = process.env.VUE_APP_API_URL || `${window.location.origin}/api`;
  public static ROOT_URL = process.env.VUE_APP_ROOT_URL || `${window.location.origin}`;

  public static async getObjectByUUID(uuid: string): Promise<AM_IObjectInfo> {
    const obj = (await Axios.get(`${this.API_URL}/object/?uuid=${uuid}`)).data
      .response as AM_IObjectInfo;
    obj.modelPath = `${this.ROOT_URL}/` + obj.modelPath;
    if (obj.previewPath) obj.previewPath = `${this.ROOT_URL}/` + obj.previewPath;
    return obj;
  }

  public static async getObjectList(): Promise<AM_IObjectInfo[]> {
    return (await Axios.get(`${this.API_URL}/object/list`)).data.response.map(
      (x: AM_IObjectInfo) => {
        x.modelPath = `${this.ROOT_URL}/` + x.modelPath;
        if (x.previewPath) x.previewPath = `${this.ROOT_URL}/` + x.previewPath;
        return x;
      },
    );
  }

  public static async getCharacterList(): Promise<AM_IObjectInfo[]> {
    return (await this.getObjectList()).filter((x) => x.category.match('character'));
  }

  public static async uploadObjectPreview(name: string, fileUrl: string): Promise<void> {
    const f = await fetch(fileUrl);
    const b = await f.blob();

    const form = new FormData();
    form.append('name', name);
    form.append('preview', new File([b], 'File name', { type: 'image/jpeg' }));

    await Axios.put(`${this.API_URL}/object/preview`, form);
  }

  public static async uploadAudio(name: string, file: File): Promise<void> {
    const form = new FormData();
    form.append('name', name);
    form.append('audio', file);

    await Axios.put(`${this.API_URL}/audio`, form);
  }

  public static animationToJson(animation: AM_Animation): any {
    return {
      fps: animation.fps,
      frameCount: animation.frameCount,
      name: animation.name,
      version: 1,
      frames: animation.frames.map((x) => {
        return {
          keys: Object.values(x.keys)
            .filter((x) => !x.isAuto)
            .map((x) => {
              let type = 0;
              if (x instanceof AM_KeyFloat) type = 1;
              // if (x instanceof AM_KeyVector2) type = 2;
              if (x instanceof AM_KeyVector3) type = 3;
              if (x instanceof AM_KeyQuaternion) type = 4;

              return {
                name: x.name,
                type,
                vBool: x.value,
                vFloat: x.value,
                vVector2: x.value,
                vVector3: x.value,
                vQuaternion: x.value,
              };
            }),
        };
      }),
    };
  }

  public static jsonToAnimation(data: AM_IAnimation): AM_Animation {
    const animation = new AM_Animation();
    const allKeys = {} as Record<string, number>;

    animation.name = data.name;
    animation.fps = data.fps;
    animation.frameCount = data.frameCount;
    for (let i = 0; i < data.frames.length; i++) {
      const frame = data.frames[i];

      animation.frames[i].keys = {};

      for (let j = 0; j < frame.keys.length; j++) {
        const key = frame.keys[j] as {
          name: string;
          type: number;
          vBool: boolean;
          vFloat: number;
          vVector3: AM_IVector3;
          vQuaternion: AM_IVector4;
        };

        if (key.type === 1)
          animation.frames[i].keys[key.name] = new AM_KeyFloat(key.name, key.vFloat);
        if (key.type === 3)
          animation.frames[i].keys[key.name] = new AM_KeyVector3(key.name, key.vVector3);
        if (key.type === 4)
          animation.frames[i].keys[key.name] = new AM_KeyQuaternion(key.name, key.vQuaternion);

        allKeys[key.name] = 0;
      }
    }

    // Interpolate all keys
    Object.keys(allKeys).forEach((x) => {
      animation.interpolateKey(x);
    });

    return animation;
  }

  public static async saveAnimation(name: string, animation: AM_Animation): Promise<void> {
    const animationData = this.animationToJson(animation);
    animationData.name = name;

    await Axios.put(`${this.API_URL}/animation`, {
      animation: JSON.stringify(animationData),
    });
  }

  public static async saveClip(name: string, objectList: AM_Object[]): Promise<void> {
    const clipData = {
      name,
      objectList: objectList.map((x) => {
        return {
          uuid: x.uuid,
          position: x.position,
          rotation: x.rotation,
          scale: x.scale,
        };
      }),
      animationList: objectList.map((x) => {
        return {
          objectUUID: x.uuid,
          animationList: x.animationController.animationList.map((x) => {
            return {
              offset: x.offset,
              animation: this.animationToJson(x.animation),
            };
          }),
        };
      }),
    };
    console.log(clipData);
    await Axios.put(`${this.API_URL}/clip`, {
      clip: JSON.stringify(clipData),
    });
  }

  public static async getAudioList(): Promise<AM_IAudioInfo[]> {
    return (await Axios.get(`${this.API_URL}/audio/list`)).data.response.map((x: AM_IAudioInfo) => {
      x.audioPath = `${this.ROOT_URL}/` + x.audioPath;
      return x;
    });
  }

  public static async getAnimationList(): Promise<string[]> {
    return (await Axios.get(`${this.API_URL}/animation/list`)).data.response;
  }

  public static async getClipList(): Promise<string[]> {
    return (await Axios.get(`${this.API_URL}/clip/list`)).data.response;
  }

  public static async getAnimation(name: string): Promise<AM_Animation> {
    const data = (await Axios.get(`${this.API_URL}/animation?name=${name}`)).data.response;
    return this.jsonToAnimation(data);
  }

  public static async getClip(name: string): Promise<AM_IClip> {
    return (await Axios.get(`${this.API_URL}/clip?name=${name}`)).data.response;
  }
}
