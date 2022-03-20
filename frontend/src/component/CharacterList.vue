<template>
  <div :class="$style.characterList">
    <ui-button
      @click="$store.dispatch('scene/loadCharacter', ch + '.fbx')"
      v-for="ch in characters"
      :key="ch"
      :text="ch"
    />
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
.characterList {
  display: flex;
}
</style>
