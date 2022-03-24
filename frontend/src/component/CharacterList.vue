<template>
  <div :class="$style.characterList">
    <ui-button
      @click="loadCharacter(ch)"
      v-for="ch in $store.state.scene.characterList"
      :key="ch.name"
      :text="ch.name"
      :class="$style.button"
      icon="arrow_down"
      iconPosition="left"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { MainScene } from '@/core/MainScene';
import { IVirtualObject } from '@/Types';

export default defineComponent({
  props: {},
  components: {},
  async mounted() {
    await this.$store.dispatch('scene/getCharacterList');
  },
  methods: {
    loadCharacter(character: IVirtualObject) {
      MainScene.loadCharacter(character.modelPath);
    },
  },
  data: () => {
    return {};
  },
});
</script>

<style lang="scss" module>
.characterList {
  display: flex;
  flex-direction: column;

  .button {
    padding: 5px;
    border-radius: 0;
  }
}
</style>
