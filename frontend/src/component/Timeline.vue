<template>
  <div :class="$style.timeline">
    <div
      :class="$style.line"
      v-for="rig in $store.state.scene.SelectedCharacter?.rigList"
      :key="rig.bone.name"
    >
      <div :class="$style.title">{{ rig.bone.name }}</div>
      <div :class="$style.keys">
        <div
          :class="[
            $style.key,
            $store.state.scene.SelectedCharacter?.animation?.frameId === y - 1
              ? $style.selected
              : '',
          ]"
          v-for="y in $store.state.scene.SelectedCharacter?.animation?.frameCount"
          :key="y"
          @click="$store.state.scene.SelectedCharacter.animation.frameId = y - 1"
        ></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {},
  components: {},
  async mounted() {
    this.kd = (e: KeyboardEvent) => {
      if (!this.$store.state.scene.SelectedCharacter) return;
      if (!this.$store.state.scene.SelectedCharacter.animation) return;

      if (e.key === 'ArrowRight') {
        this.$store.state.scene.SelectedCharacter.animation.frameId += 1;
      }
      if (e.key === 'ArrowLeft') {
        this.$store.state.scene.SelectedCharacter.animation.frameId -= 1;
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
          background: #fe0000;
        }
      }
    }
  }
}
</style>
