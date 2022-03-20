<template>
  <div :class="$style.scene">
    <div
      class="clickable"
      :class="[$style.object, $store.state.scene.selectedObject === x ? $style.selected : null]"
      v-for="x in $store.state.scene.objectList"
      :key="x.uuid"
      @click="$store.dispatch('scene/selectObject', x)"
    >
      {{ x.type }} {{ x.name }}
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

    &.selected {
      background: #33a833;
      color: #ffffff;
    }
  }
}
</style>
