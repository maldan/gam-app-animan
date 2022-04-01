<template>
  <div :class="$style.characterList">
    <ui-button
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
import { AM_Core } from '@/core/AM_Core';
import { AM_State } from '@/core/AM_State';

export default defineComponent({
  props: {},
  components: {},
  async mounted() {
    this.list = await AM_API.getCharacterList();
  },
  methods: {
    async addToScene(obj: AM_IObjectInfo) {
      const ch = await AM_State.loadObject(obj.modelPath);
      AM_State.addObject(ch);
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
    padding: 5px;
    border-radius: 0;
  }
}
</style>
