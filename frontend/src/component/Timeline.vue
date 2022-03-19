<template>
  <div :class="$style.timeline">
    <div :class="$style.line" v-for="k in $store.state.scene.SelectedCharacter?.keyList" :key="k">
      <div :class="$style.title">{{ k }}</div>
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
  async mounted() {},
  methods: {},
  data: () => {
    return {};
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
