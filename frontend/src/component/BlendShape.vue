<template>
  <div :class="$style.blendShape">
    <div
      :class="$style.shape"
      v-for="(x, i) in $store.state.scene.SelectedCharacter?.blendShapeNameList"
      :key="x"
    >
      <div>{{ x }}</div>
      <ui-input
        :class="$style.input"
        v-model="$store.state.scene.SelectedCharacter.blendShapeValueList[i]"
      />
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
    return {
      characters: ['Coco'],
    };
  },
});
</script>

<style lang="scss" module>
.blendShape {
  display: flex;
  flex-direction: column;

  .shape {
    display: flex;
    align-items: center;

    .input {
      flex: none;
      width: 32px;
      margin-left: auto;
    }
  }
}
</style>
