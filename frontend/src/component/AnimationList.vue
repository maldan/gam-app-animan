<template>
  <div :class="$style.animationList">
    <desktop-ui-button
      @click="loadAnimation(x)"
      v-for="x in list"
      :key="x"
      :text="x"
      :class="$style.button"
      icon="arrow_down"
      iconPosition="left"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { AM_API } from '@/core/AM_API';
import { AM_State } from '@/core/AM_State';
import { AM_Character } from '@/core/am/AM_Character';
import { AM_IAnimationInfo } from '@/core/AM_Type';

export default defineComponent({
  props: {},
  components: {},
  async mounted() {
    this.list = await AM_API.getAnimationList();
  },
  methods: {
    async loadAnimation(name: string) {
      const animation = await AM_API.getAnimation(name);
      AM_State.objectList
        .filter((x) => x instanceof AM_Character)
        .forEach((x) => {
          (x as AM_Character).resetPose();
        });
      AM_State.animationController.animationList = [{ offset: 0, animation }];
      AM_State.animationController.compile();
      AM_State.ui.refresh();
    },
  },
  data: () => {
    return {
      list: [] as AM_IAnimationInfo[],
    };
  },
});
</script>

<style lang="scss" module>
.animationList {
  display: flex;
  flex-direction: column;

  .button {
    margin-bottom: 5px;
  }
}
</style>
