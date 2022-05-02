<template>
  <!-- Animation list -->
  <div :class="$style.controller">
    <div :class="$style.left">
      <!-- Header -->
      <div :class="$style.header">
        <div class="button_group_round_compact">
          <desktop-ui-button @click="createAnimation" text="New" icon="file" />
          <desktop-ui-button @click="pickAnimation" text="Append" icon="plus" />
          <desktop-ui-button @click="pickAudio" text="Add audio" icon="plus" />
        </div>
      </div>

      <!-- Numbers -->
      <div v-if="animationList.length" :class="$style.numbers">
        <div
          :class="[$style.number]"
          v-for="frameId in Math.min(animationController.frameCount, maxVisibleFrames)"
          :key="frameId"
        >
          {{ (frameId - 1 + offsetX) % 5 === 0 ? frameId - 1 + offsetX : '' }}
        </div>
      </div>

      <!-- Position -->
      <div v-if="animationList.length" :class="$style.position">
        <div
          @click="
            animationController.frameId = frameId - 1 + offsetX;
            refresh();
          "
          class="clickable"
          :class="[
            $style.key,
            animationController.frameId === frameId - 1 + offsetX ? $style.current : null,
          ]"
          v-for="frameId in Math.min(animationController.frameCount, maxVisibleFrames)"
          :key="frameId"
        ></div>
      </div>

      <!-- Animation list -->
      <div
        :class="$style.lines"
        :style="{
          width: Math.min(animationController.frameCount, maxVisibleFrames) * frameWidth + 'px',
        }"
      >
        <div
          class="clickable"
          :class="[$style.animationPart, x === selectedAnimationPart ? $style.selected : null]"
          @click="selectAnimationPart(x)"
          v-doubleclick="openAnimationPart.bind(this, x)"
          @mouseover="hoverAnimationPart = x"
          @mouseout="hoverAnimationPart = undefined"
          v-for="x in animationList"
          :style="{
            left: (x.offset - offsetX) * frameWidth + 'px',
            width: frameWidth * x.animation.frameCount * x.repeat + 'px',
          }"
          :key="x"
        >
          {{ x.animation.name }}
        </div>
      </div>

      <!-- Audio list -->
      <div
        :class="$style.lines"
        :style="{
          width: Math.min(animationController.frameCount, maxVisibleFrames) * frameWidth + 'px',
        }"
      >
        <div
          class="clickable"
          :class="[$style.audioPart]"
          v-for="x in audioList"
          :style="{
            left: (x.offset - offsetX) * frameWidth + 'px',
            width: frameWidth * x.audio.widthInFrames * x.repeat + 'px',
          }"
          :key="x"
        >
          {{ x.audio.name }}
        </div>
      </div>
    </div>

    <!-- Right menu -->
    <div :class="$style.right">
      <div v-if="selectedAnimationPart">
        <desktop-ui-number
          @change="refresh"
          v-model="selectedAnimationPart.offset"
          style="margin-bottom: 5px"
        />
        <desktop-ui-number
          @change="refresh"
          v-model="selectedAnimationPart.animation.frameCount"
          style="margin-bottom: 5px"
        />
        <desktop-ui-number
          @change="
            refresh();
            compileAnimation();
          "
          v-model="selectedAnimationPart.repeat"
          style="margin-bottom: 5px"
        />
        <desktop-ui-input
          @change="refresh"
          v-model="selectedAnimationPart.animation.name"
          style="margin-bottom: 5px"
        />
        <desktop-ui-button
          @click="deleteAnimationPart(selectedAnimationPart)"
          text="Delete"
          icon="trash"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { AM_State } from '@/core/AM_State';
import {
  AM_AnimationController,
  AM_IAnimationPart,
  AM_IAudioPart,
} from '@/core/animation/AM_AnimationController';
import { AM_Object } from '@/core/am/AM_Object';
import { AM_API } from '@/core/AM_API';

export default defineComponent({
  props: {
    selectedObject: Object,
    isFocus: Boolean,
  },
  components: {},
  computed: {
    animationController(): AM_AnimationController | undefined {
      if (this.r < 0) return undefined;
      return this.selectedObject?.animationController;
    },
    animationList(): AM_IAnimationPart[] {
      if (this.r < 0) return [];
      return this.animationController?.animationList || [];
    },
    audioList(): AM_IAudioPart[] {
      if (this.r < 0) return [];
      return this.animationController?.audioList || [];
    },
    selectedAnimationPart(): AM_IAnimationPart | undefined {
      if (this.r < 0) return undefined;
      return this.animationController?.selectedAnimationPart;
    },
    isAnimationPlay(): boolean {
      if (this.r < 0) return false;
      return AM_State.isAnimationPlay;
    },
  },
  async mounted() {
    this.initEvents();
  },
  beforeUnmount() {
    this.removeEvents();
  },
  watch: {
    isFocus(v: boolean) {
      if (v) this.initEvents();
      else this.removeEvents();
    },
  },
  methods: {
    initEvents() {
      this.removeEvents();

      this.kd = (e: KeyboardEvent) => {
        if (!this.animationController) return;

        // Offset animation controller
        if (AM_State.mode === 'animation') {
          if (e.key === 'ArrowRight') {
            this.animationController.frameId += 1;
            this.refresh();
          }
          if (e.key === 'ArrowLeft') {
            this.animationController.frameId -= 1;
            this.refresh();
          }
        } else {
          if (e.key === 'ArrowRight') {
            AM_State.globalFrameId += 1;
            this.refresh();
          }
          if (e.key === 'ArrowLeft') {
            AM_State.globalFrameId -= 1;
            this.refresh();
          }
        }
      };
      document.addEventListener('keydown', this.kd);
    },
    removeEvents() {
      document.removeEventListener('keydown', this.kd);
    },
    refresh() {
      this.r = Math.random();

      /*this.animationController?.off('change');
      this.animationController?.on('change', () => {
        AM_State.selectedObject?.applyAnimation(this.animationController?.animation);
        this.refresh();
      });*/

      if (this.animationController) {
        this.offsetX = Math.max(0, this.animationController.frameId - this.maxVisibleFrames + 1);
      }
    },
    createAnimation() {
      this.animationController?.createAnimation();
      this.refresh();
    },
    compileAnimation() {
      this.animationController?.compile();
      this.refresh();
    },
    selectAnimationPart(x: AM_IAnimationPart | undefined) {
      (this.selectedObject as AM_Object).animationController.selectedAnimationPart = x;
      // AM_State.selectedAnimationPart = x;
      this.refresh();
    },
    openAnimationPart(x: AM_IAnimationPart | undefined) {
      this.hoverAnimationPart = undefined;
      (this.selectedObject as AM_Object).animationController.selectedAnimationPart = x;
      (this.selectedObject as AM_Object).animationController.workingOnAnimationPart = x;
      //AM_State.selectedAnimationPart = undefined;
      //AM_State.selectedAnimation = x?.animation;

      AM_State.ui.refresh();
    },
    pickAnimation(): void {
      this.$store.dispatch('modal/show', {
        name: 'pick/animation',
        data: {},
        onSuccess: async () => {
          const an = await AM_API.animation.get(this.$store.state.modal.data.name);
          this.animationController?.appendAnimation(an);
          AM_State.ui.refresh();
        },
      });
    },
    pickAudio(): void {
      this.$store.dispatch('modal/show', {
        name: 'pick/audio',
        data: {},
        onSuccess: async () => {
          const audioInfo = await AM_API.audio.getInfo(this.$store.state.modal.data.resourceId);
          this.animationController?.appendAudio(audioInfo);
          AM_State.ui.refresh();
        },
      });
    },
    deleteAnimationPart(x: AM_IAnimationPart) {
      this.animationController?.deleteAnimationPart(x);
      this.selectAnimationPart(undefined);
      this.refresh();
    },
  },
  data: () => {
    return {
      r: 0,

      kd: undefined as any,

      frameWidth: 9,
      maxVisibleFrames: 48,
      maxVisibleKeys: 12,

      hoverAnimationPart: undefined as AM_IAnimationPart | undefined,
      // selectedAnimationPart: undefined as AM_IAnimationPart | undefined,

      // Scroll
      offsetX: 0,
      offsetY: 0,
    };
  },
});
</script>

<style lang="scss" module>
@import 'src/gam_sdk_ui/vue/style/color';
@import 'src/gam_sdk_ui/vue/style/size';

.controller {
  display: flex;

  .left {
    flex: 1;

    .header {
      display: flex;
      margin-bottom: 10px;
    }

    .numbers {
      display: flex;
      margin-bottom: 10px;

      .number {
        width: 8px;
        margin-right: 1px;
        font-size: 12px;
        color: $text-gray;
      }
    }

    .position {
      display: flex;
      margin-bottom: 10px;

      .key {
        width: 8px;
        height: 14px;
        background: #161616;
        margin-right: 1px;

        &.current {
          background: #0000ff;
        }
      }
    }

    .lines {
      background: #1b1b1b;
      overflow: hidden;

      .animationPart,
      .audioPart {
        height: 24px;
        background: #9a6927;
        position: relative;
        border: 1px solid #fefefe00;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        font-size: 14px;
        padding-left: 5px;
        margin-bottom: 2px;

        &.selected {
          border: 1px solid #eca824;
        }
      }

      .audioPart {
        background: #3a9a27;
        overflow: hidden;
      }
    }
  }

  .right {
    width: 200px;
  }
}
</style>
