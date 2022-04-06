<template>
  <div :class="$style.shapeList">
    <div :class="$style.shape" v-for="(x, i) in shapeList" :key="x">
      <div :class="$style.name">{{ x.name }}</div>
      <div :class="$style.value">
        <ui-slider v-model="shapeValues[i]" @change="setShapeKey(x.name, $event)" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { AM_State } from '@/core/AM_State';
import { AM_Character } from '@/core/am/AM_Character';

export default defineComponent({
  props: {},
  components: {},
  computed: {
    character(): AM_Character | undefined {
      if (this.r < 0) return undefined;
      if (AM_State.selectedObject instanceof AM_Character) return AM_State.selectedObject;
      return undefined;
    },
    shapeList() {
      if (this.r < 0) return [];
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
    },
    setShapeKey(name: string, value: number) {
      if (!this.character) return;

      this.character.setShapeKey(name, value);
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
.shapeList {
  display: flex;
  flex-direction: column;
  font-size: 14px;
  user-select: none;

  .shape {
    display: flex;

    .name {
      width: 128px;
      overflow: hidden;
    }

    .value {
      flex: 1;
    }
  }
}
</style>
