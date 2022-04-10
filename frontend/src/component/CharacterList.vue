<template>
  <div :class="$style.characterList">
    <desktop-ui-button
      @click="addToScene(ch)"
      v-for="ch in list"
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
import { AM_API } from '@/core/AM_API';
import { AM_IObjectInfo } from '@/core/am/AM_Object';
import { AM_State } from '@/core/AM_State';
import { AM_Core } from '@/core/AM_Core';
import { AM_Character } from '@/core/am/AM_Character';

export default defineComponent({
  props: {},
  components: {},
  async mounted() {
    this.list = await AM_API.getCharacterList();
  },
  methods: {
    async addToScene(obj: AM_IObjectInfo) {
      const chList = AM_State.objectList.filter((x) => x instanceof AM_Character);
      chList.forEach((x) => {
        AM_State.removeObject(x);
      });

      const ch = await AM_State.loadObject(obj.modelPath, 'character');
      ch.animationController = AM_State.animationController;
      AM_State.addObject(ch);
      AM_State.selectObject(ch);
      AM_Core.setManipulatorTo(ch);
    },
  },
  data: () => {
    return {
      list: [] as AM_IObjectInfo[],
    };
  },
});
</script>

<style lang="scss" module>
.characterList {
  display: flex;
  flex-direction: column;

  .button {
    margin-bottom: 5px;
  }
}
</style>
