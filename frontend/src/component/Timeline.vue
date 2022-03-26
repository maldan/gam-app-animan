<template>
  <div :class="$style.timeline">
    <div :class="$style.header">
      <ui-button :class="$style.button" text="Play" />
      <ui-input :class="$style.input" v-model="frameCount" />
      <ui-button @click="setNewFrameCount" :class="$style.button" icon="check" :iconSize="14" />
    </div>

    <div :class="$style.line">
      <div style="width: 137px"></div>
      <div :class="$style.number" v-for="x in maxFrames" :key="x">
        {{ (x - 1) % 5 === 0 ? x + offsetX - 1 : '' }}
      </div>
    </div>

    <div :class="$style.line" v-for="(rig, rigIndex) in rigList" :key="rig.bone.name">
      <div
        @click="selectKey(rig.bone.name)"
        :class="[$style.title, selectedKeys.includes(rig.bone.name) ? $style.selected : null]"
      >
        {{ rig.bone.name }}
      </div>
      <div :class="[$style.keys, selectedKeys.includes(rig.bone.name) ? $style.selected : null]">
        <div
          class="clickable"
          :class="[
            $style.key,
            animation?.frameId === frameId - 1 + offsetX ? $style.selected : '',
            animation.frames[frameId - 1 + offsetX].keys[rig.bone.name] ? $style.has : '',
            animation.frames[frameId - 1 + offsetX].keys[rig.bone.name]?.isAuto ? $style.auto : '',
          ]"
          v-for="frameId in Math.min(~~animation?.frameCount, maxFrames)"
          :key="frameId"
          @mousedown="dragFromFrameId = frameId - 1 + offsetX"
          @mouseover="hoverFrameId = frameId - 1 + offsetX"
          @mouseup="dragFrame"
          @click="
            currentKeyIndex = rigIndex;
            goToFrame(frameId - 1 + offsetX);
            selectKey(rig.bone.name);
            previousKeyIndex = rigIndex;
          "
        ></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Animation_Character } from '@/core/Animation_Character';
import { MainScene } from '@/core/MainScene';
import { DataStorage } from '@/core/DataStorage';
import { Animation_Sequence } from '@/core/Animation_Sequence';
import { Animation_Key } from '@/core/Animation_Key';

export default defineComponent({
  props: {},
  components: {},
  computed: {
    rigList() {
      if (this.r < 0) return [];
      if (!MainScene.selectedObject) return [];
      const ch = MainScene.selectedObject.userData.class as Animation_Character;
      if (this.filterKeys.length === 0) return ch.rigList;
      return ch.rigList.filter((x) => this.filterKeys.includes(x.bone.name));
    },
    animation(): Animation_Sequence {
      // @ts-ignore
      if (this.r < 0) return null;
      return MainScene.selectedObject?.userData?.class?.animation;
    },
    character(): Animation_Character | undefined {
      if (this.r < 0) return undefined;
      return MainScene.selectedObject?.userData?.class;
    },
    offsetX(): number {
      if (!this.animation) return 0;
      return Math.max(this.animation.frameId - this.maxFrames + 1, 0);
    },
  },
  async mounted() {
    this.kd = (e: KeyboardEvent) => {
      if (!MainScene.selectedObject) return;
      if (MainScene.selectedObject?.userData.tag !== 'Character') return;

      if (e.key === 'Shift') this.isShiftPressed = true;

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
        for (let i = 0; i < this.bufferKeys.length; i++) {
          const keyName = this.bufferKeys[i].name;
          delete this.animation.currentFrame.keys[keyName];
          this.animation.interpolateKey(keyName);
        }
        this.refresh();
      }
    };
    this.ku = (e: KeyboardEvent) => {
      if (e.key === 'Shift') this.isShiftPressed = false;
    };
    document.addEventListener('keydown', this.kd);
    document.addEventListener('keyup', this.ku);

    MainScene.ui.timeline.ref = this;
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.kd);
    document.removeEventListener('keyup', this.ku);
  },
  methods: {
    refresh() {
      this.r = Math.random();
    },
    goToFrame(id: number) {
      this.animation.frameId = id;
      this.refresh();
    },
    selectKey(key: string) {
      this.selectedKeys.length = 0;

      if (this.isShiftPressed) {
        const min = Math.min(this.currentKeyIndex, this.previousKeyIndex);
        const len = Math.abs(this.currentKeyIndex - this.previousKeyIndex);

        for (let i = 0; i <= len; i++) {
          this.selectedKeys.push(this.rigList[min + i].bone.name);
        }
      } else {
        this.selectedKeys.push(key);
      }
    },
    setLayers(layer: string) {
      this.filterKeys.length = 0;
      if (layer === 'Body') this.filterKeys.push('Root', 'Belly', 'Chest', 'Neck', 'Head');
      if (layer === 'Hand')
        this.filterKeys.push('Arm.L', 'Forearm.L', 'Hand.L', 'Arm.R', 'Forearm.R', 'Hand.R');

      if (layer === 'Head')
        this.filterKeys.push(
          'Eye.L',
          'Eye.R',
          'Nose',
          'Neck',
          'Head',
          'Tongue_0',
          'Tongue_1',
          'Tongue_2',
        );

      DataStorage.selectedTimelineLayer = layer;
      if (this.character) {
        this.character.setKeysVisibility(this.filterKeys);
      }
    },
    dragFrame() {
      if (this.dragFromFrameId === this.hoverFrameId) return;

      const fromFrame = this.animation.frames[this.dragFromFrameId];
      const toFrame = this.animation.frames[this.hoverFrameId];

      for (let i = 0; i < this.selectedKeys.length; i++) {
        const key = this.selectedKeys[i];

        // Skip null and auto keys
        if (!fromFrame.keys[key]) continue;
        if (fromFrame.keys[key].isAuto) continue;

        // Move keys
        toFrame.keys[key] = fromFrame.keys[key];
        delete fromFrame.keys[key];

        this.animation.interpolateKey(key);
      }

      this.refresh();
    },
    setNewFrameCount() {
      this.animation.resize(Number(this.frameCount));
      this.refresh();
    },
  },
  data: () => {
    return {
      kd: undefined as any,
      ku: undefined as any,
      r: 0,
      filterKeys: [] as string[],
      selectedKeys: [] as string[],
      bufferKeys: [] as { name: string; key: Animation_Key }[],
      dragFromFrameId: 0,
      hoverFrameId: 0,
      isShiftPressed: false,
      previousKeyIndex: 0,
      currentKeyIndex: 0,
      frameCount: '48',
      maxFrames: 48,
    };
  },
});
</script>

<style lang="scss" module>
@import '../gam_sdk_ui/vue/style/color';
@import '../gam_sdk_ui/vue/style/size';

.timeline {
  .header {
    font-size: 14px;
    color: $text-gray;
    margin-bottom: 10px;
    display: flex;

    .button {
      padding: 5px;
      font-size: 14px;
    }

    .input {
      input {
        padding: 5px;
        font-size: 14px;
      }
    }
  }

  .line {
    display: flex;
    margin-bottom: 1px;

    .number {
      width: 8px;
      font-size: 12px;
      color: $text-gray;
      margin-right: 1px;
    }

    .title {
      min-width: 128px;
      font-size: 14px;
      color: $text-gray;
      background: lighten($gray-dark, 5%);
      border-right: 4px solid #4c4c4c;
      margin-right: 5px;

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
        }

        &.auto {
          background: #feba33;
        }
      }
    }
  }
}
</style>
