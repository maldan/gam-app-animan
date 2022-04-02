<template>
  <div v-if="animationController" :class="$style.timeline">
    <!-- Animation list -->
    <div v-if="!animationPart">
      <ui-button @click="createAnimation" text="Add animation" style-type="small" />

      <div @click="selectAnimationPart(x)" v-for="x in animationList" :key="x">{{ x.offset }}</div>
    </div>

    <!-- Animation -->
    <div v-if="animationPart">
      <ui-button @click="selectAnimationPart(undefined)" text="Back" style-type="small" />

      <div :class="$style.line" v-for="key in keys" :key="key">
        <div :class="$style.name">{{ key }}</div>
        <div :class="$style.keys">
          <div
            @click="goToFrame(frameId - 1)"
            class="clickable"
            :class="[
              $style.key,
              animationPart.animation.frames[frameId - 1].keys[key] ? $style.has : null,
              animationPart.animation.frameId === frameId - 1 ? $style.selected : null,
            ]"
            v-for="frameId in animationPart.animation.frameCount"
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
  },
  async mounted() {
    AM_State.ui.timeline.ref = this;
    AM_State.ui.timeline.refresh();
  },
  methods: {
    refresh() {
      this.r = Math.random();
    },
    createAnimation() {
      this.animationController?.createAnimation();
      this.refresh();
    },
    selectAnimationPart(x: AM_IAnimationPart | undefined) {
      this.animationPart = x;
      AM_State.selectedAnimation = x?.animation;
      if (AM_State.selectedAnimation) {
        AM_State.selectedAnimation.on('change', () => {
          AM_State.selectedObject?.applyAnimation();
        });
      }
    },
    goToFrame(id: number) {
      if (this.animationPart?.animation) this.animationPart.animation.frameId = id;
      this.refresh();
    },
  },
  data: () => {
    return {
      r: 0,
      animationPart: undefined as AM_IAnimationPart | undefined,
    };
  },
});
</script>

<style lang="scss" module>
@import '../gam_sdk_ui/vue/style/color';
@import '../gam_sdk_ui/vue/style/size';

.timeline {
  .line {
    display: flex;
    margin-bottom: 1px;

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
