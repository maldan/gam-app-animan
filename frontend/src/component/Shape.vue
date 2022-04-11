<template>
  <div :class="$style.shapeList">
    <div :class="$style.shape" v-for="(x, i) in shapeList" :key="x">
      <div :class="$style.name">{{ x.name }}</div>
      <div :class="$style.value">
        <desktop-ui-slider v-model="shapeValues[i]" @change="setShapeKey(x.name, $event)" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { AM_State } from '@/core/AM_State';
import { AM_Character } from '@/core/am/AM_Character';
import { AM_KeyQuaternion } from '@/core/animation/key/AM_KeyQuaternion';
import { AM_KeyFloat } from '@/core/animation/key/AM_KeyFloat';

export default defineComponent({
  props: {},
  components: {},
  computed: {
    character(): AM_Character | undefined {
      if (this.r < 0) return undefined;
      if (AM_State.mode === 'pose') {
        return AM_State.objectList.find((x) => x instanceof AM_Character) as AM_Character;
      }
      if (AM_State.selectedObject instanceof AM_Character) return AM_State.selectedObject;
      return undefined;
    },
    shapeList() {
      if (this.r < 0) return [];
      if (AM_State.mode === 'pose') {
        const ch = AM_State.objectList.find((x) => x instanceof AM_Character) as AM_Character;
        if (ch) return ch.shapeList;
        return [];
      }
      if (!AM_State.selectedAnimation) return [];
      if (AM_State.selectedObject instanceof AM_Character) return AM_State.selectedObject.shapeList;
      return [];
    },
  },
  async mounted() {
    AM_State.ui.shape.ref = this;
    AM_State.ui.shape.refresh();
  },
  methods: {
    refresh() {
      this.r = Math.random();
      this.$nextTick(() => {
        for (let i = 0; i < this.shapeList.length; i++) {
          this.shapeValues[i] = this.shapeList[i].value;
        }
      });
    },
    setShapeKey(name: string, value: number) {
      if (!this.character) return;
      if (AM_State.mode === 'pose') {
        this.character.setShapeKey(name, value);
        AM_State.ui.refresh();
        return;
      }
      if (!AM_State.selectedAnimation) return;

      this.character.setShapeKey(name, value);
      AM_State.selectedAnimation.setCurrentKey(new AM_KeyFloat(`shape.${name}`, value));

      AM_State.ui.refresh();
    },
  },
  data: () => {
    return {
      r: 0,
      shapeValues: new Array(64).fill(0),
    };
  },
});
</script>

<style lang="scss" module>
@import 'src/gam_sdk_ui/vue/style/color';
@import 'src/gam_sdk_ui/vue/style/size';

.shapeList {
  display: flex;
  flex-direction: column;
  font-size: 14px;
  user-select: none;

  .shape {
    display: flex;
    align-items: center;
    margin-bottom: 5px;

    .name {
      flex: 1;
      overflow: hidden;
      font-size: 12px;
      color: $text-gray;
    }

    .value {
      width: 64px;
    }
  }
}
</style>
