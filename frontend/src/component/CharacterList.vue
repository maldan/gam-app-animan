<template>
  <div :class="$style.characterList">
    <ui-button
      @click="loadCharacter(ch)"
      v-for="ch in characters"
      :key="ch"
      :text="ch"
      :class="$style.button"
      icon="arrow_down"
      iconPosition="left"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { MainScene } from '@/core/MainScene';

export default defineComponent({
  props: {},
  components: {},
  async mounted() {},
  methods: {
    loadCharacter(name: string) {
      MainScene.loadCharacter(name + '.fbx');
    },
  },
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

  .button {
    padding: 5px;
    border-radius: 0;
  }
}
</style>
