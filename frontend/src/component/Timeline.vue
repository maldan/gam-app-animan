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
          @click="animation.frameId = frameId - 1"
        ></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Animation_Character } from '@/core/Animation_Character';

export default defineComponent({
  props: {},
  components: {},
  computed: {
    rigList() {
      if (!this.$store.state.scene.selectedObject) return [];
      const ch = this.$store.state.scene.selectedObject.userData.class as Animation_Character;
      return ch.rigList || [];
    },
    animation() {
      return this.$store.state.scene.selectedObject?.userData?.class?.animation;
    },
  },
  async mounted() {
    this.kd = (e: KeyboardEvent) => {
      if (!this.$store.state.scene.selectedObject) return;
      if (this.$store.state.scene.selectedObject.userData.tag !== 'Character') return;

      if (e.key === 'ArrowRight') {
        this.animation.frameId += 1;
      }
      if (e.key === 'ArrowLeft') {
        this.animation.frameId -= 1;
      }
    };
    document.addEventListener('keydown', this.kd);
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.kd);
  },
  methods: {},
  data: () => {
    return {
      kd: undefined as any,
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
