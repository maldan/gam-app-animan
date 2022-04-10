<template>
  <!-- Animation list -->
  <div :class="$style.animation" @mouseover="isOver = true" @mouseout="isOver = false">
    <!-- Header -->
    <div :class="$style.header">
      <desktop-ui-button
        @click="backFromAnimation"
        text="Back"
        style="flex: none; margin-right: 10px"
      />

      <div class="button_group_round_compact">
        <desktop-ui-button
          @click="toggleKeyVisibility('position')"
          text="P"
          :isSelected="keyVisibility['position']"
        />
        <desktop-ui-button
          @click="toggleKeyVisibility('rotation')"
          text="R"
          :isSelected="keyVisibility['rotation']"
        />
        <desktop-ui-button
          @click="toggleKeyVisibility('scale')"
          text="S"
          :isSelected="keyVisibility['scale']"
        />
        <desktop-ui-button
          @click="toggleKeyVisibility('boneFingers')"
          text="Finger"
          :isSelected="keyVisibility['boneFingers']"
        />
        <desktop-ui-button
          @click="toggleKeyVisibility('boneToes')"
          text="Toe"
          :isSelected="keyVisibility['boneToes']"
        />
        <desktop-ui-button
          @click="toggleKeyVisibility('left')"
          text="L"
          :isSelected="keyVisibility['left']"
        />
        <desktop-ui-button
          @click="toggleKeyVisibility('right')"
          text="R"
          :isSelected="keyVisibility['right']"
        />
      </div>
    </div>

    <!-- Numbers -->
    <div :class="$style.numbers" style="margin-left: 138px">
      <div
        :class="[$style.number]"
        v-for="frameId in Math.min(animationController.frameCount, maxVisibleFrames)"
        :key="frameId"
      >
        {{ (frameId - 1 + offsetX) % 5 === 0 ? frameId - 1 + offsetX : '' }}
      </div>
    </div>

    <!-- Keys -->
    <div :class="$style.line" v-for="key in keys" :key="key">
      <div :class="[$style.name, selectedKeys.find((x) => x.key === key) ? $style.selected : null]">
        {{ key }}
      </div>
      <div :class="$style.keys">
        <div
          @click="
            goToFrame(frameId - 1);
            clearKeySelection();
            selectKey(key, frameId - 1);
          "
          @mouseover="
            hoverKeyName = key;
            hoverFrameId = frameId - 1;
          "
          @mousedown="
            dragKeyName = key;
            dragFrameId = frameId - 1;
          "
          @mouseup="dragKey"
          class="clickable"
          :class="[
            $style.key,
            animation.frames[frameId - 1].keys[key] ? $style.has : null,
            animation.frameId === frameId - 1 ? $style.current : null,
            animation.frames[frameId - 1].keys[key]?.isAuto ? $style.auto : null,
            selectedKeys.find((x) => x.key === key && x.frameId === frameId - 1)
              ? $style.selected
              : null,
          ]"
          v-for="frameId in animation.frameCount"
          :key="frameId"
        ></div>
      </div>
    </div>
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
    keys(): string[] {
      if (this.r < 0) return [];
      const keys = (this.selectedObject?.exposedKeys || []).filter((x) => {
        if (!this.keyVisibility['position'] && x.match('.position')) return false;
        if (!this.keyVisibility['rotation'] && x.match('.rotation')) return false;
        if (!this.keyVisibility['scale'] && x.match('.scale')) return false;
        if (!this.keyVisibility['boneFingers'] && x.match('bone.Finger_')) return false;
        if (!this.keyVisibility['boneToes'] && x.match('bone.Toe_')) return false;
        if (!this.keyVisibility['left'] && x.match('.L.')) return false;
        if (!this.keyVisibility['right'] && x.match('.R.')) return false;
        return true;
      });
      const outKeys = [];
      for (let i = 0; i < Math.min(this.maxVisibleKeys, keys.length); i++) {
        const key = keys[i + this.offsetY];
        outKeys.push(key);
      }
      return outKeys;
    },
    animation(): AM_Animation | undefined {
      if (this.r < 0) return undefined;
      return AM_State.selectedAnimation;
    },
  },
  async mounted() {
    this.kd = (e: KeyboardEvent) => {
      if (!this.animation) return;

      if (e.key === 'Shift') this.isShiftPressed = true;

      if (e.key === 'ArrowRight') {
        this.animation.frameId += 1;

        if (AM_State.mode === 'clip') {
          const offset = this.animation.controller?.getAnimationOffset(this.animation) ?? 0;
          AM_State.globalFrameId = offset + this.animation.frameId;
        }

        this.refresh();
      }
      if (e.key === 'ArrowLeft') {
        this.animation.frameId -= 1;

        if (AM_State.mode === 'clip') {
          const offset = this.animation.controller?.getAnimationOffset(this.animation) ?? 0;
          AM_State.globalFrameId = offset + this.animation.frameId;
        }

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

    this.ku = (e: KeyboardEvent) => {
      if (e.key === 'Shift') this.isShiftPressed = false;
    };

    this.wheel = (e: WheelEvent) => {
      if (!this.isOver) return;

      if (e.deltaY > 0) this.offsetY += 1;
      else this.offsetY -= 1;
      if (this.offsetY <= 0) this.offsetY = 0;
      this.refresh();
    };

    document.addEventListener('keydown', this.kd);
    document.addEventListener('keyup', this.ku);
    document.addEventListener('wheel', this.wheel);
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.kd);
    document.removeEventListener('keyup', this.ku);
    document.removeEventListener('wheel', this.wheel);
  },
  methods: {
    refresh() {
      this.r = Math.random();

      this.animation?.off('change');
      this.animation?.on('change', () => {
        if (AM_State.selectedObject instanceof AM_Bone)
          AM_State.selectedObject.parent.applyAnimation(this.animation);
        else AM_State.selectedObject?.applyAnimation(this.animation);

        AM_State.ui.shape.refresh();
      });

      if (this.animationController) {
        this.offsetX = Math.max(0, this.animationController.frameId - this.maxVisibleFrames + 1);
      }
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
    },
    goToFrame(id: number) {
      if (this.animation) this.animation.frameId = id;
      this.refresh();
    },
    backFromAnimation() {
      // Remove old listener
      if (AM_State.selectedAnimation) AM_State.selectedAnimation.off('change');

      AM_State.selectedAnimationPart = undefined;
      AM_State.selectedAnimation = undefined;

      this.animationController?.compile();
      AM_State.ui.refresh();
    },
    dragKey() {
      if (this.dragFrameId === this.hoverFrameId) return;
      if (!this.animation) return;
      const fromKey = this.animation?.frames?.[this.dragFrameId]?.keys[this.dragKeyName];
      if (!fromKey) return;
      if (fromKey.isAuto) return;
      if (!this.animation?.frames[this.hoverFrameId]) return;

      // Remove previous
      delete this.animation.frames[this.dragFrameId].keys[this.dragKeyName];
      // Set new
      this.animation.frames[this.hoverFrameId].keys[this.hoverKeyName] = fromKey.clone();
      this.animation.interpolateKey(fromKey.name);
      AM_State.ui.timeline.refresh();
    },
  },
  data: () => {
    return {
      r: 0,
      isOver: false,

      kd: undefined as any,
      ku: undefined as any,
      wheel: undefined as any,

      isShiftPressed: false,
      frameWidth: 9,

      maxVisibleFrames: 48,
      maxVisibleKeys: 12,

      dragKeyName: '',
      dragFrameId: 0,
      hoverKeyName: '',
      hoverFrameId: 0,

      keyVisibility: {
        position: true,
        rotation: true,
        scale: true,
        boneFingers: true,
        boneToes: true,
        left: true,
        right: true,
      } as Record<string, boolean>,

      selectedKeys: [] as { key: string; frameId: number }[],

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

.animation {
  display: flex;
  flex-direction: column;

  .header {
    display: flex;
    margin-bottom: 10px;
    align-items: center;
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

  .line {
    display: flex;
    margin-bottom: 1px;
    min-height: 16px;

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
