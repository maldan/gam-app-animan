<template>
  <div v-if="animationController" :class="$style.timeline">
    <!-- Animation list -->
    <div :class="$style.controller" v-if="editMode === 'controller'">
      <div :class="$style.left">
        <!-- Header -->
        <div class="button_group_round_compact" :class="$style.header">
          <desktop-ui-button @click="createAnimation" text="Add animation" />
          <desktop-ui-button @click="compileAnimation" text="Compile" />
          <desktop-ui-button @click="togglePlay" :text="isAnimationPlay ? 'Stop' : 'Play'" />
        </div>

        <!-- Timeline -->
        <!-- Numbers -->
        <div v-if="animationList.length" :class="[$style.line, $style.numbers]">
          <div :class="$style.keys">
            <div
              :class="[$style.key]"
              v-for="frameId in Math.min(animationController.frameCount, maxVisibleFrames)"
              :key="frameId"
            >
              {{ (frameId - 1 + offsetX) % 5 === 0 ? frameId - 1 + offsetX : '' }}
            </div>
          </div>
        </div>
        <!-- Animation list -->
        <div v-if="animationList.length" :class="$style.line">
          <div :class="$style.keys">
            <div
              :class="[
                $style.key,
                animationController.frameId === frameId - 1 + offsetX ? $style.selected : null,
              ]"
              v-for="frameId in Math.min(animationController.frameCount, maxVisibleFrames)"
              :key="frameId"
            ></div>
          </div>
        </div>

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
              width: frameWidth * x.animation.frameCount + 'px',
            }"
            :key="x"
          >
            {{ x.animation.name }}
          </div>
        </div>
      </div>

      <div :class="$style.right">
        <div v-if="selectedAnimationPart">
          <ui-number @change="refresh" v-model="selectedAnimationPart.offset" />
          <ui-number @change="refresh" v-model="selectedAnimationPart.animation.frameCount" />
          <ui-input @change="refresh" v-model="selectedAnimationPart.animation.name" />
        </div>
      </div>
    </div>

    <!-- Animation -->
    <div :class="$style.animation" v-if="editMode === 'animation' && animation">
      <div :class="$style.left" style="display: flex; margin-bottom: 10px; align-items: center">
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
        </div>
      </div>

      <!-- Numbers -->
      <div :class="[$style.line, $style.numbers]">
        <div :class="$style.keys">
          <div
            :class="[$style.key]"
            v-for="frameId in Math.min(animationController.frameCount, maxVisibleFrames)"
            :key="frameId"
          >
            {{ (frameId - 1 + offsetX) % 5 === 0 ? frameId - 1 + offsetX : '' }}
          </div>
        </div>
      </div>

      <!-- Keys -->
      <div :class="$style.line" v-for="key in keys" :key="key">
        <div
          :class="[$style.name, selectedKeys.find((x) => x.key === key) ? $style.selected : null]"
        >
          {{ key }}
        </div>
        <div :class="$style.keys">
          <div
            @click="
              goToFrame(frameId - 1);
              clearKeySelection();
              selectKey(key, frameId - 1);
            "
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
    },
  },
  async mounted() {
    AM_State.ui.timeline.ref = this;
    AM_State.ui.timeline.refresh();

    this.kdAnimation = (e: KeyboardEvent) => {
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
    document.addEventListener('wheel', this.wheel);
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.kdAnimation);
    document.removeEventListener('keydown', this.kdController);
    document.removeEventListener('keyup', this.ku);
    document.removeEventListener('wheel', this.wheel);
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
    },
  },
  data: () => {
    return {
      kdAnimation: undefined as any,
      kdController: undefined as any,
      ku: undefined as any,
      wheel: undefined as any,
      isShiftPressed: false,

      r: 0,
      hoverAnimationPart: undefined as AM_IAnimationPart | undefined,
      editMode: 'controller',

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
      offsetY: 0,
    };
  },
});
</script>

<style lang="scss" module>
@import '../gam_sdk_ui/vue/style/color';
@import '../gam_sdk_ui/vue/style/size';

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

      .header {
        display: flex;
        margin-bottom: 10px;
      }

      .line {
        margin-bottom: 10px;
      }

      .lines {
        background: #1b1b1b;
        overflow: hidden;
      }
    }

    .right {
      width: 200px;
    }
  }

  .line {
    display: flex;
    margin-bottom: 1px;
    min-height: 16px;

    /*.number {
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
