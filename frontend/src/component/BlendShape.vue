<template>
  <div :class="$style.blendShape">
    <div :class="$style.shape" v-for="(x, i) in blendShapeNameList" :key="x">
      <div>{{ x }}</div>
      <ui-slider :class="$style.input" v-model="shapeList[i]" @change="changeShape(x, i, $event)" />
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
    character(): Animation_Character {
      // @ts-ignore
      if (this.r < 0) return undefined;
      return MainScene.selectedObject?.userData?.class;
    },
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
  async mounted() {
    MainScene.ui.blendShape.ref = this;
  },
  methods: {
    changeShape(name: string, index: number, value: number) {
      this.character.setCurrentShapeKey(name, value);
      this.character.tick();
      this.blendShapeValueList[index] = value;
      MainScene.ui.timeline.refresh();
    },
    refresh() {
      this.r = Math.random();

      for (let i = 0; i < this.blendShapeValueList.length; i++) {
        this.shapeList[i] = this.blendShapeValueList[i];
      }
    },
  },
  data: () => {
    return {
      r: 0,
      shapeList: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] as number[],
    };
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
