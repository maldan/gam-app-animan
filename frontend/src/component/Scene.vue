<template>
  <div :class="$style.scene">
    <div
      class="clickable"
      :class="[$style.object, isSelected(x) ? $style.selected : null]"
      v-for="x in objectList"
      :key="x.name"
      @click="selectObject(x)"
    >
      {{ x.type }} {{ x.name }}
      <ui-icon @click.stop="removeObject(x)" :class="$style.remove" name="trash" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { AM_State } from '@/core/AM_State';
import { AM_Object } from '@/core/am/AM_Object';

export default defineComponent({
  props: {},
  components: {},
  computed: {
    objectList() {
      if (this.r === 0) return [];
      return AM_State.objectList;
    },
  },
  async mounted() {
    AM_State.ui.scene.ref = this;
    AM_State.ui.scene.refresh();
  },
  methods: {
    refresh() {
      this.r = Math.random();
    },
    isSelected(obj: AM_Object): boolean {
      return AM_State.selectedObject === obj;
    },
    removeObject(obj: AM_Object) {
      AM_State.removeObject(obj);
    },
    selectObject(obj: AM_Object) {
      AM_State.selectObject(obj);
    },
  },
  data: () => {
    return {
      r: 0,
    };
  },
});
</script>

<style lang="scss" module>
.scene {
  display: flex;
  flex-direction: column;
  font-size: 14px;
  user-select: none;

  .object {
    background: #1b1b1b;
    color: #999999;
    padding: 5px;
    margin-bottom: 1px;
    display: flex;
    align-items: center;

    .remove {
      margin-left: auto;
    }

    &.selected {
      background: #33a833;
      color: #ffffff;
    }
  }
}
</style>
