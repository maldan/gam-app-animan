import Axios from 'axios';
import { AM_Object } from '@/core/object/AM_Object';
import { AM_Animation } from '@/core/animation/AM_Animation';
import { AM_KeyFloat } from '@/core/animation/key/AM_KeyFloat';
import { AM_KeyVector3 } from '@/core/animation/key/AM_KeyVector3';
import { AM_KeyQuaternion } from '@/core/animation/key/AM_KeyQuaternion';
import {
  AM_IAnimation,
  AM_IClip,
  AM_IKey,
  AM_IPose,
  AM_IResourceInfo,
  AM_IVector2,
  AM_IVector3,
  AM_IVector4,
} from '@/core/AM_Type';
import { AM_Character } from '@/core/object/AM_Character';
import { AM_KeyVector2 } from '@/core/animation/key/AM_KeyVector2';

export class AM_API {
  public static API_URL = process.env.VUE_APP_API_URL || `${window.location.origin}/api`;
  public static ROOT_URL = process.env.VUE_APP_ROOT_URL || `${window.location.origin}`;

  public static pose = {
    async get(name: string): Promise<AM_IPose> {
      return (await Axios.get(`${AM_API.API_URL}/pose?name=${name}`)).data.response;
    },
    async getInfo(resourceId: string): Promise<AM_IResourceInfo> {
      return (await Axios.get(`${AM_API.API_URL}/pose/info?resourceId=${resourceId}`)).data
        .response;
    },
    async getList(): Promise<AM_IResourceInfo[]> {
      return (await Axios.get(`${AM_API.API_URL}/pose/list`)).data.response;
    },
    async create(name: string): Promise<AM_IResourceInfo> {
      return (
        await Axios.put(`${AM_API.API_URL}/pose`, {
          name,
          data: JSON.stringify({
            keys: [],
          }),
        })
      ).data.response;
    },
    async save(name: string, character: AM_Character): Promise<void> {
      const poseData = {
        keys: [] as AM_IKey[],
      };

      // Bone list
      for (const x in character.boneList) {
        const bone = character.boneList[x];

        if (bone.isRotationChanged) {
          poseData.keys.push({
            name: `bone.${character.boneList[x].name}.rotation`,
            type: 4,
            vBool: false,
            vFloat: 0,
            vVector2: { x: 0, y: 0 },
            vVector3: { x: 0, y: 0, z: 0 },
            vQuaternion: bone.rotationOffset,
          });
        }

        if (bone.isPositionChanged) {
          poseData.keys.push({
            name: `bone.${character.boneList[x].name}.position`,
            type: 3,
            vBool: false,
            vFloat: 0,
            vVector2: { x: 0, y: 0 },
            vVector3: bone.positionOffset,
            vQuaternion: { x: 0, y: 0, z: 0, w: 1 },
          });
        }
      }

      // Shape list
      for (const x in character.shapeList) {
        const shape = character.shapeList[x];
        if (shape.value != 0) {
          poseData.keys.push({
            name: `shape.${character.shapeList[x].name}`,
            type: 1,
            vBool: false,
            vFloat: character.shapeList[x].value,
            vVector2: { x: 0, y: 0 },
            vVector3: { x: 0, y: 0, z: 0 },
            vQuaternion: {
              x: 0,
              y: 0,
              z: 0,
              w: 1,
            },
          });
        }
      }

      console.log(poseData);
      await Axios.put(`${AM_API.API_URL}/pose`, {
        name,
        data: JSON.stringify(poseData),
      });
    },
  };

  public static animation = {
    async get(name: string): Promise<AM_Animation> {
      const data = (await Axios.get(`${AM_API.API_URL}/animation?name=${name}`)).data.response;
      return this.fromJSON(data);
    },
    async getInfo(resourceId: string): Promise<AM_IResourceInfo> {
      return (await Axios.get(`${AM_API.API_URL}/animation/info?resourceId=${resourceId}`)).data
        .response;
    },
    async save(name: string, animation: AM_Animation): Promise<void> {
      const animationData = this.toJSON(animation);
      animationData.name = name;
      await Axios.put(`${AM_API.API_URL}/animation`, {
        data: JSON.stringify(animationData),
      });
    },
    toJSON(animation: AM_Animation): AM_IAnimation {
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
                const out: AM_IKey = {
                  name: x.name,
                  type: 0,
                  vBool: false,
                  vFloat: 0,
                  vVector2: { x: 0, y: 0 },
                  vVector3: { x: 0, y: 0, z: 0 },
                  vQuaternion: { x: 0, y: 0, z: 0, w: 0 },
                };
                if (x instanceof AM_KeyFloat) {
                  out.type = 1;
                  out.vFloat = x.value;
                }
                if (x instanceof AM_KeyVector2) {
                  out.type = 2;
                  out.vVector2 = x.value;
                }
                if (x instanceof AM_KeyVector3) {
                  out.type = 3;
                  out.vVector3 = x.value;
                }
                if (x instanceof AM_KeyQuaternion) {
                  out.type = 4;
                  out.vQuaternion = x.value;
                }

                return out;
              }),
          };
        }),
      };
    },
    fromJSON(data: AM_IAnimation): AM_Animation {
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
            vVector2: AM_IVector2;
            vVector3: AM_IVector3;
            vQuaternion: AM_IVector4;
          };

          if (key.type === 1)
            animation.frames[i].keys[key.name] = new AM_KeyFloat(key.name, key.vFloat);
          if (key.type === 2)
            animation.frames[i].keys[key.name] = new AM_KeyVector2(key.name, key.vVector2);
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
    },
  };

  public static object = {
    async getInfo(resourceId: string): Promise<AM_IResourceInfo> {
      const obj = (await Axios.get(`${AM_API.API_URL}/object/info?resourceId=${resourceId}`)).data
        .response as AM_IResourceInfo;
      obj.filePath = `${AM_API.ROOT_URL}/` + obj.filePath;
      if (obj.previewPath) obj.previewPath = `${AM_API.ROOT_URL}/` + obj.previewPath;
      return obj;
    },
  };

  public static audio = {
    async getList(): Promise<AM_IResourceInfo[]> {
      return (await Axios.get(`${AM_API.API_URL}/audio/list`)).data.response.map(
        (x: AM_IResourceInfo) => {
          x.filePath = `${AM_API.ROOT_URL}/` + x.filePath;
          return x;
        },
      );
    },
    async getInfo(resourceId: string): Promise<AM_IResourceInfo> {
      const obj = (await Axios.get(`${AM_API.API_URL}/audio/info?resourceId=${resourceId}`)).data
        .response as AM_IResourceInfo;
      obj.filePath = `${AM_API.ROOT_URL}/` + obj.filePath;
      return obj;
    },
  };

  public static clip = {
    async getInfo(resourceId: string): Promise<AM_IResourceInfo> {
      return (await Axios.get(`${AM_API.API_URL}/clip/info?resourceId=${resourceId}`)).data
        .response;
    },

    async save(name: string, objectList: AM_Object[]): Promise<void> {
      // Build audio list
      const audioList = [];
      for (let i = 0; i < objectList.length; i++) {
        for (let j = 0; j < objectList[i].animationController.audioList.length; j++) {
          audioList.push({
            objectId: objectList[i].id,
            resourceId: objectList[i].animationController.audioList[j].audio.resourceId,
            offset: objectList[i].animationController.audioList[j].offset,
            repeat: objectList[i].animationController.audioList[j].repeat,
            volume: objectList[i].animationController.audioList[j].volume,
          });
        }
      }

      // Prepare clip data
      const clipData = {
        name,
        objectList: objectList.map((x) => {
          return {
            id: x.id,
            resourceId: x.resourceId,
            kind: x.kind,
            name: x.name,
            params: x.params,
          };
        }),
        animationList: objectList.map((x) => {
          return {
            objectId: x.id,
            animationList: x.animationController.animationList.map((x) => {
              return {
                offset: x.offset,
                repeat: x.repeat,
                animation: AM_API.animation.toJSON(x.animation),
              };
            }),
          };
        }),
        audioList: audioList,
      };

      // Save
      await Axios.put(`${AM_API.API_URL}/clip`, {
        data: JSON.stringify(clipData),
      });
    },
  };

  public static async getObjectList(): Promise<AM_IResourceInfo[]> {
    return (await Axios.get(`${this.API_URL}/object/list`)).data.response.map(
      (x: AM_IResourceInfo) => {
        x.filePath = `${this.ROOT_URL}/` + x.filePath;
        if (x.previewPath) x.previewPath = `${this.ROOT_URL}/` + x.previewPath;
        return x;
      },
    );
  }

  public static async getCharacterList(): Promise<AM_IResourceInfo[]> {
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
  /*
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
*/

  public static async getAudioList(): Promise<AM_IResourceInfo[]> {
    return (await Axios.get(`${this.API_URL}/audio/list`)).data.response.map(
      (x: AM_IResourceInfo) => {
        x.filePath = `${this.ROOT_URL}/` + x.filePath;
        return x;
      },
    );
  }

  public static async getAnimationList(): Promise<AM_IResourceInfo[]> {
    return (await Axios.get(`${this.API_URL}/animation/list`)).data.response;
  }

  public static async getClipList(): Promise<AM_IResourceInfo[]> {
    return (await Axios.get(`${this.API_URL}/clip/list`)).data.response;
  }

  public static async createClip(name: string): Promise<AM_IResourceInfo> {
    return (
      await Axios.put(`${this.API_URL}/clip`, {
        data: JSON.stringify({
          name,
          objectList: [],
          animationList: [],
        }),
      })
    ).data.response;
  }

  public static async createAnimation(name: string): Promise<AM_IResourceInfo> {
    return (
      await Axios.put(`${this.API_URL}/animation`, {
        data: JSON.stringify({
          name,
          fps: 24,
          frameCount: 4,
          frames: [{ keys: [] }, { keys: [] }, { keys: [] }, { keys: [] }],
        }),
      })
    ).data.response;
  }

  /*public static async getAnimation(name: string): Promise<AM_Animation> {
    const data = (await Axios.get(`${this.API_URL}/animation?name=${name}`)).data.response;
    return this.jsonToAnimation(data);
  }*/

  public static async getClip(name: string): Promise<AM_IClip> {
    return (await Axios.get(`${this.API_URL}/clip?name=${name}`)).data.response;
  }

  /*public static async getClipInfo(resourceId: string): Promise<AM_IResourceInfo> {
    return (await Axios.get(`${this.API_URL}/clip/info?resourceId=${resourceId}`)).data.response;
  }*/

  /*public static async getAnimationInfo(resourceId: string): Promise<AM_IAnimationInfo> {
    return (await Axios.get(`${this.API_URL}/animation/info?resourceId=${resourceId}`)).data
      .response;
  }*/
}
