<template>
  <div :class="$style.characterList">1</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {},
  components: {},
  async mounted() {
    // await this.$store.dispatch('character/getList');
  },
  methods: {
    /*loadCharacter(character: IVirtualObject) {
      MainScene.loadCharacter(character.modelPath);
    },*/
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
