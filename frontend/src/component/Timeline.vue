<template>
  <div v-if="animationController" :class="$style.timeline">
    <!-- Animation list -->
    <div v-if="editMode === 'controller'">
      <ui-button @click="createAnimation" text="Add animation" style-type="small" />

      <!-- X -->
      <div :class="$style.line">
        <div :class="$style.keys">
          <div
            :class="[
              $style.key,
              animationController.frameId === frameId - 1 ? $style.selected : null,
            ]"
            v-for="frameId in animationController.frameCount"
            :key="frameId"
          ></div>
        </div>
      </div>

      <div
        class="clickable"
        :class="$style.animationPart"
        @click="selectAnimationPart(x)"
        @mouseover="hoverAnimationPart = x"
        @mouseout="hoverAnimationPart = undefined"
        v-for="x in animationList"
        :style="{
          left: x.offset * frameWidth + 'px',
          width: frameWidth * x.animation.frameCount + 'px',
        }"
        :key="x"
      ></div>
    </div>

    <!-- Animation -->
    <div v-if="editMode === 'animation' && animation">
      <ui-button @click="backFromAnimation" text="Back" style-type="small" />

      <div :class="$style.line" v-for="key in keys" :key="key">
        <div :class="$style.name">{{ key }}</div>
        <div :class="$style.keys">
          <div
            @click="goToFrame(frameId - 1)"
            class="clickable"
            :class="[
              $style.key,
              animation.frames[frameId - 1].keys[key] ? $style.has : null,
              animation.frameId === frameId - 1 ? $style.selected : null,
              animation.frames[frameId - 1].keys[key]?.isAuto ? $style.auto : null,
            ]"
            v-for="frameId in animation.frameCount"
            :key="frameId"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { AM_State } from '@/core/AM_State';
import { AM_AnimationController, AM_IAnimationPart } from '@/core/animation/AM_AnimationController';
import { AM_Animation } from '@/core/animation/AM_Animation';

export default defineComponent({
  props: {},
  components: {},
  computed: {
    keys() {
      return AM_State.selectedObject?.exposedKeys || [];
    },
    animationController(): AM_AnimationController | undefined {
      if (this.r < 0) return undefined;
      return AM_State.selectedObject?.animationController;
    },
    animationList(): AM_IAnimationPart[] {
      return this.animationController?.animationList || [];
    },
    animation(): AM_Animation | undefined {
      if (this.r < 0) return undefined;
      return AM_State.selectedAnimation;
    },
  },
  async mounted() {
    AM_State.ui.timeline.ref = this;
    AM_State.ui.timeline.refresh();

    this.kdAnimation = (e: KeyboardEvent) => {
      if (this.editMode !== 'animation') return;

      if (e.key === 'Shift') this.isShiftPressed = true;

      if (e.key === 'ArrowRight' && this.animation) {
        this.animation.frameId += 1;
        this.refresh();
      }
      if (e.key === 'ArrowLeft' && this.animation) {
        this.animation.frameId -= 1;
        this.refresh();
      }

      /*if (!MainScene.selectedObject) return;
      if (MainScene.selectedObject?.userData.tag !== 'Character') return;

      if (e.key === 'ArrowRight') {
        this.animation.frameId += 1;
        this.refresh();
      }
      if (e.key === 'ArrowLeft') {
        this.animation.frameId -= 1;
        this.refresh();
      }
      // Copy
      if (e.ctrlKey && e.key === 'c') {
        this.bufferKeys.length = 0;
        for (let i = 0; i < this.selectedKeys.length; i++) {
          const key = this.animation.currentFrame.keys[this.selectedKeys[i]];
          if (key.isAuto) continue;
          this.bufferKeys.push({
            name: this.selectedKeys[i],
            key,
          });
        }
      }
      // Paste
      if (e.ctrlKey && e.key === 'v') {
        for (let i = 0; i < this.bufferKeys.length; i++) {
          this.animation.currentFrame.keys[this.bufferKeys[i].name] =
            this.bufferKeys[i].key.clone();
          this.animation.interpolateKey(this.bufferKeys[i].name);
        }
        // this.bufferKeys.length = 0;
        this.refresh();
      }
      // Delete key
      if (e.key === 'Delete') {
        for (let i = 0; i < this.selectedKeys.length; i++) {
          delete this.animation.currentFrame.keys[this.selectedKeys[i]];
          this.animation.interpolateKey(this.selectedKeys[i]);
        }
        this.refresh();
      }*/
    };
    this.kdController = (e: KeyboardEvent) => {
      if (this.editMode !== 'controller') return;
      if (!this.animationController) return;

      // Offset animation
      if (e.key === 'ArrowRight' && this.hoverAnimationPart) {
        this.hoverAnimationPart.offset += 1;
        this.animationController.compile();
        this.refresh();
      }
      if (e.key === 'ArrowLeft' && this.hoverAnimationPart) {
        this.hoverAnimationPart.offset -= 1;
        this.animationController.compile();
        this.refresh();
      }

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
    document.addEventListener('keydown', this.kdAnimation);
    document.addEventListener('keydown', this.kdController);
    document.addEventListener('keyup', this.ku);
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.kdAnimation);
    document.removeEventListener('keydown', this.kdController);
    document.removeEventListener('keyup', this.ku);
  },
  methods: {
    refresh() {
      this.r = Math.random();

      // Remove old
      this.animationController?.off('change');
      this.animation?.off('change');

      if (this.editMode === 'controller') {
        this.animationController?.on('change', () => {
          AM_State.selectedObject?.applyAnimation(this.animationController?.animation);
        });
      } else {
        this.animation?.on('change', () => {
          AM_State.selectedObject?.applyAnimation(this.animation);
        });
      }
    },
    createAnimation() {
      this.animationController?.createAnimation();
      this.refresh();
    },
    selectAnimationPart(x: AM_IAnimationPart | undefined) {
      this.hoverAnimationPart = undefined;
      AM_State.selectedAnimation = x?.animation;

      if (x) this.editMode = 'animation';
      else this.editMode = 'controller';

      this.refresh();
    },
    goToFrame(id: number) {
      if (this.animation) this.animation.frameId = id;
      this.refresh();
    },
    backFromAnimation() {
      // Remove old listener
      if (AM_State.selectedAnimation) AM_State.selectedAnimation.off('change');

      this.selectAnimationPart(undefined);
      this.animationController?.compile();
      this.refresh();
    },
  },
  data: () => {
    return {
      kdAnimation: undefined as any,
      kdController: undefined as any,
      ku: undefined as any,
      isShiftPressed: false,

      r: 0,
      //animationPart: undefined as AM_IAnimationPart | undefined,
      hoverAnimationPart: undefined as AM_IAnimationPart | undefined,
      editMode: 'controller',

      frameWidth: 9,
    };
  },
});
</script>

<style lang="scss" module>
@import '../gam_sdk_ui/vue/style/color';
@import '../gam_sdk_ui/vue/style/size';

.timeline {
  .animationPart {
    height: 24px;
    background: #35822d;
    margin-bottom: 5px;
    position: relative;
  }

  .line {
    display: flex;
    margin-bottom: 1px;
    min-height: 16px;

    .number {
      width: 8px;
      font-size: 12px;
      color: $text-gray;
      margin-right: 1px;
    }

    .name {
      min-width: 128px;
      font-size: 14px;
      color: $text-gray;
      background: lighten($gray-dark, 5%);
      border-right: 4px solid #4c4c4c;
      margin-right: 5px;
      display: flex;
      align-items: center;

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

        &.selected {
          background: #0000ff;
        }

        &.has {
          background: #fe0000;

          &.selected {
            background: lighten(#0000ff, 30%);
          }
        }

        &.auto {
          background: #feba33;

          &.selected {
            background: lighten(#0000ff, 50%);
          }
        }
      }
    }
  }
}
</style>
