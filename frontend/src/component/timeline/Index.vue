<template>
  <div v-if="animationController" :class="$style.timeline">
    <timeline-controller ref="controller" v-if="!animation" />
    <timeline-animation ref="animation" v-if="animation" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { AM_State } from '@/core/AM_State';
import { AM_AnimationController, AM_IAnimationPart } from '@/core/animation/AM_AnimationController';
import { AM_Animation } from '@/core/animation/AM_Animation';
import { AM_Object } from '@/core/am/AM_Object';
import { AM_Bone } from '@/core/am/AM_Bone';

export default defineComponent({
  props: {},
  components: {},
  computed: {
    selectedObject(): AM_Object | undefined {
      if (this.r < 0) return undefined;
      if (AM_State.selectedObject instanceof AM_Bone) return AM_State.selectedObject.parent;
      return AM_State.selectedObject;
    },
    animationController(): AM_AnimationController | undefined {
      if (this.r < 0) return undefined;
      return this.selectedObject?.animationController;
    },
    animation(): AM_Animation | undefined {
      if (this.r < 0) return undefined;
      return AM_State.selectedAnimation;
    },
    /*selectedObject(): AM_Object | undefined {
      if (this.r < 0) return undefined;
      if (AM_State.selectedObject instanceof AM_Bone) return AM_State.selectedObject.parent;
      return AM_State.selectedObject;
    },
    keys(): string[] {
      if (this.r < 0) return [];
      const keys = (this.selectedObject?.exposedKeys || []).filter((x) => {
        if (!this.keyVisibility['position'] && x.match('.position')) return false;
        if (!this.keyVisibility['rotation'] && x.match('.rotation')) return false;
        if (!this.keyVisibility['scale'] && x.match('.scale')) return false;
        return true;
      });
      const outKeys = [];
      for (let i = 0; i < Math.min(this.maxVisibleKeys, keys.length); i++) {
        const key = keys[i + this.offsetY];
        outKeys.push(key);
      }
      return outKeys;
    },
    animationController(): AM_AnimationController | undefined {
      if (this.r < 0) return undefined;
      return this.selectedObject?.animationController;
    },
    animationList(): AM_IAnimationPart[] {
      if (this.r < 0) return [];
      return this.animationController?.animationList || [];
    },
    animation(): AM_Animation | undefined {
      if (this.r < 0) return undefined;
      return AM_State.selectedAnimation;
    },
    selectedAnimationPart(): AM_IAnimationPart | undefined {
      if (this.r < 0) return undefined;
      return AM_State.selectedAnimationPart;
    },
    isAnimationPlay(): boolean {
      if (this.r < 0) return false;
      return AM_State.isAnimationPlay;
    },
    interactionMode(): string {
      if (this.r < 0) return 'object';
      return AM_State.interactionMode;
    },*/
  },
  async mounted() {
    AM_State.ui.timeline.ref = this;
    AM_State.ui.timeline.refresh();

    /*this.kdAnimation = (e: KeyboardEvent) => {
      if (this.editMode !== 'animation') return;
      if (!this.animation) return;

      if (e.key === 'Shift') this.isShiftPressed = true;

      if (e.key === 'ArrowRight') {
        this.animation.frameId += 1;
        this.refresh();
      }
      if (e.key === 'ArrowLeft') {
        this.animation.frameId -= 1;
        this.refresh();
      }

      // Delete key
      if (e.key === 'Delete') {
        for (let i = 0; i < this.selectedKeys.length; i++) {
          delete this.animation.frames[this.selectedKeys[i].frameId].keys[this.selectedKeys[i].key];
          this.animation.interpolateKey(this.selectedKeys[i].key);
        }
        this.refresh();
      }
    };
    this.kdController = (e: KeyboardEvent) => {
      if (this.editMode !== 'controller') return;
      if (!this.animationController) return;

      // Offset animation controller
      if (e.key === 'ArrowRight' && !this.hoverAnimationPart) {
        this.animationController.frameId += 1;
        this.refresh();
      }
      if (e.key === 'ArrowLeft' && !this.hoverAnimationPart) {
        this.animationController.frameId -= 1;
        this.refresh();
      }
    };
    this.ku = (e: KeyboardEvent) => {
      if (e.key === 'Shift') this.isShiftPressed = false;
    };
    this.wheel = (e: WheelEvent) => {
      if (e.deltaY > 0) this.offsetY += 1;
      else this.offsetY -= 1;
      if (this.offsetY <= 0) this.offsetY = 0;
      this.refresh();
    };
    document.addEventListener('keydown', this.kdAnimation);
    document.addEventListener('keydown', this.kdController);
    document.addEventListener('keyup', this.ku);
    document.addEventListener('wheel', this.wheel);*/
  },
  beforeUnmount() {
    /*document.removeEventListener('keydown', this.kdAnimation);
    document.removeEventListener('keydown', this.kdController);
    document.removeEventListener('keyup', this.ku);
    document.removeEventListener('wheel', this.wheel);*/
  },
  methods: {
    refresh() {
      this.r = Math.random();

      // @ts-ignore
      this.$refs['controller']?.refresh();
      // @ts-ignore
      this.$refs['animation']?.refresh();
    },
    /*refresh() {
      this.r = Math.random();

      // Remove old
      this.animationController?.off('change');
      this.animation?.off('change');

      if (this.editMode === 'controller') {
        this.animationController?.on('change', () => {
          AM_State.selectedObject?.applyAnimation(this.animationController?.animation);
          this.refresh();
        });
      } else {
        this.animation?.on('change', () => {
          if (AM_State.selectedObject instanceof AM_Bone)
            AM_State.selectedObject.parent.applyAnimation(this.animation);
          else AM_State.selectedObject?.applyAnimation(this.animation);
        });
      }

      if (this.animationController) {
        this.offsetX = Math.max(0, this.animationController.frameId - this.maxVisibleFrames + 1);
      }

      if (AM_State.selectedAnimation === undefined) {
        this.editMode = 'controller';
      }
    },
    createAnimation() {
      this.animationController?.createAnimation();
      this.refresh();
    },
    selectAnimationPart(x: AM_IAnimationPart | undefined) {
      AM_State.selectedAnimationPart = x;
      this.refresh();
    },
    openAnimationPart(x: AM_IAnimationPart | undefined) {
      this.hoverAnimationPart = undefined;
      AM_State.selectedAnimationPart = undefined;
      AM_State.selectedAnimation = x?.animation;

      if (x) this.editMode = 'animation';
      else this.editMode = 'controller';

      this.refresh();
    },
    compileAnimation() {
      this.animationController?.compile();
      this.refresh();
    },
    goToFrame(id: number) {
      if (this.animation) this.animation.frameId = id;
      this.refresh();
    },
    backFromAnimation() {
      // Remove old listener
      if (AM_State.selectedAnimation) AM_State.selectedAnimation.off('change');

      this.openAnimationPart(undefined);
      this.animationController?.compile();
      this.refresh();
    },
    togglePlay() {
      AM_State.isAnimationPlay = !AM_State.isAnimationPlay;
      this.refresh();
    },
    toggleInteractionMode() {
      AM_State.interactionMode = AM_State.interactionMode === 'pose' ? 'object' : 'pose';
      this.refresh();
    },
    toggleKeyVisibility(key: string): void {
      this.keyVisibility[key] = !this.keyVisibility[key];
      this.refresh();
    },
    clearKeySelection() {
      this.selectedKeys.length = 0;
    },
    selectKey(key: string, frameId: number): void {
      this.selectedKeys.push({ key, frameId });
    },*/
  },
  data: () => {
    return {
      r: 0,
      editMode: 'controller',

      /*kdAnimation: undefined as any,
      kdController: undefined as any,
      ku: undefined as any,
      wheel: undefined as any,
      isShiftPressed: false,


      hoverAnimationPart: undefined as AM_IAnimationPart | undefined,


      frameWidth: 9,

      maxVisibleFrames: 48,
      maxVisibleKeys: 12,

      keyVisibility: {
        position: true,
        rotation: true,
        scale: true,
      } as Record<string, boolean>,

      selectedKeys: [] as { key: string; frameId: number }[],

      // Scroll
      offsetX: 0,
      offsetY: 0,*/
    };
  },
});
</script>

<style lang="scss" module>
@import 'src/gam_sdk_ui/vue/style/color';
@import 'src/gam_sdk_ui/vue/style/size';

.timeline {
  .controller,
  .animation {
    .left {
      .numbers {
        font-size: 12px;
        color: $text-gray;
        margin-bottom: 3px;

        .keys {
          .key {
            background: none;
          }
        }
      }
    }
  }

  .controller {
    display: flex;

    .animationPart {
      height: 24px;
      background: #9a6927;
      // margin-bottom: 5px;
      position: relative;
      border: 1px solid #fefefe00;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      font-size: 14px;
      padding-left: 5px;

      &.selected {
        border: 1px solid #eca824;
      }
    }

    .left {
      flex: 1;
    }

    .right {
      width: 200px;
    }
  }

  .line {
    display: flex;
    margin-bottom: 1px;
    min-height: 16px;

    /*.numbers {
      width: 8px;
      font-size: 12px;
      color: $text-gray;
      margin-right: 1px;
    }*/

    .name {
      width: 128px;
      font-size: 14px;
      color: $text-gray;
      background: lighten($gray-dark, 5%);
      border-right: 4px solid #4c4c4c;
      margin-right: 5px;
      display: flex;
      align-items: center;
      overflow: hidden;
      text-overflow: ellipsis;

      &.selected {
        border-right: 4px solid #26b518;
        background: #4a4a4a;
      }
    }

    .keys {
      display: flex;

      &.selected {
        .key {
          background: #262626;
        }
      }

      .key {
        width: 8px;
        background: #161616;
        margin-right: 1px;

        &.current {
          background: #0000ff;
        }

        &.selected {
          background: #18b14a;
        }

        &.has {
          background: #fe0000;

          &.current {
            background: lighten(#0000ff, 30%);
          }
        }

        &.auto {
          background: #feba33;

          &.current {
            background: lighten(#0000ff, 50%);
          }
        }
      }
    }
  }
}
</style>
