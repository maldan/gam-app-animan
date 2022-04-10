<template>
  <div :class="$style.clipList">
    <desktop-ui-button
      @click="loadClip(x)"
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

export default defineComponent({
  props: {},
  components: {},
  async mounted() {
    this.list = await AM_API.getClipList();
  },
  methods: {
    async loadClip(name: string) {
      const clip = await AM_API.getClip(name);
      console.log(clip);

      /*
      AM_State.objectList
        .filter((x) => x instanceof AM_Character)
        .forEach((x) => {
          (x as AM_Character).resetPose();
        });
      AM_State.animationController.animationList = [{ offset: 0, animation }];
      AM_State.animationController.compile();
      AM_State.ui.refresh();*/
    },
  },
  data: () => {
    return {
      list: [] as string[],
    };
  },
});
</script>

<style lang="scss" module>
.clipList {
  display: flex;
  flex-direction: column;

  .button {
    margin-bottom: 5px;
  }
}
</style>
