<template>
  <div :class="$style.blendShape">
    <div :class="$style.shape" v-for="(x, i) in blendShapeNameList" :key="x">
      <div>{{ x }}</div>
      <ui-slider :class="$style.input" v-model="blendShapeValueList[i]" />
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
    blendShapeNameList() {
      if (!MainScene.selectedObject) return [];
      const ch = MainScene.selectedObject.userData.class as Animation_Character;
      return ch.blendShapeNameList || [];
    },
    blendShapeValueList() {
      if (!MainScene.selectedObject) return [];
      const ch = MainScene.selectedObject.userData.class as Animation_Character;
      return ch.blendShapeValueList || [];
    },
  },
  async mounted() {},
  methods: {},
  data: () => {
    return {};
  },
});
</script>

<style lang="scss" module>
@import '../gam_sdk_ui/vue/style/color';
@import '../gam_sdk_ui/vue/style/size';

.blendShape {
  display: flex;
  flex-direction: column;

  .shape {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: $text-gray;

    .input {
      flex: none;
      width: 96px;
      margin-left: auto;
    }
  }
}
</style>
