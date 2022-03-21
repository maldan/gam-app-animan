<template>
  <div :class="$style.timeline">
    <div :class="$style.line" v-for="rig in rigList" :key="rig.bone.name">
      <div :class="$style.title">{{ rig.bone.name }}</div>
      <div :class="$style.keys">
        <div
          :class="[
            $style.key,
            animation?.frameId === frameId - 1 ? $style.selected : '',
            animation.frames[frameId - 1].keys[rig.bone.name] ? $style.has : '',
            animation.frames[frameId - 1].keys[rig.bone.name]?.isAuto ? $style.auto : '',
          ]"
          v-for="frameId in animation?.frameCount"
          :key="frameId"
          @click="goToFrame(frameId - 1)"
        ></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Animation_Character } from '@/core/Animation_Character';
import { MainScene } from '@/core/MainScene';

export default defineComponent({
  props: {},
  components: {},
  computed: {
    rigList() {
      if (this.r < 0) return [];
      if (!MainScene.selectedObject) return [];
      const ch = MainScene.selectedObject.userData.class as Animation_Character;
      return ch.rigList || [];
    },
    animation() {
      if (this.r < 0) return null;
      return MainScene.selectedObject?.userData?.class?.animation;
    },
  },
  async mounted() {
    this.kd = (e: KeyboardEvent) => {
      if (!MainScene.selectedObject) return;
      if (MainScene.selectedObject?.userData.tag !== 'Character') return;

      if (e.key === 'ArrowRight') {
        this.animation.frameId += 1;
        this.refresh();
      }
      if (e.key === 'ArrowLeft') {
        this.animation.frameId -= 1;
        this.refresh();
      }
    };
    document.addEventListener('keydown', this.kd);

    MainScene.ui.timeline.ref = this;
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.kd);
  },
  methods: {
    refresh() {
      this.r = Math.random();
    },
    goToFrame(id: number) {
      this.animation.frameId = id;
      this.refresh();
    },
  },
  data: () => {
    return {
      kd: undefined as any,
      r: 0,
    };
  },
});
</script>

<style lang="scss" module>
.timeline {
  .line {
    display: flex;
    margin-bottom: 1px;

    .title {
      min-width: 128px;
      font-size: 14px;
    }

    .keys {
      display: flex;

      .key {
        width: 10px;
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
