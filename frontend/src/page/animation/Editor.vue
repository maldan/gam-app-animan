<template>
  <div class="main">
    <div ref="scene"></div>

    <!-- Window list -->
    <desktop-ui-window
      v-for="x in windowList"
      :key="x.name"
      :title="x.title"
      :initData="x.position"
    >
      <template v-slot:body>
        <component :is="x.name" />
      </template>
    </desktop-ui-window>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { AM_Core } from '@/core/AM_Core';
import { AM_State } from '@/core/AM_State';
import { AM_API } from '@/core/AM_API';
import { AM_Character } from '@/core/am/AM_Character';

export default defineComponent({
  components: {},
  async mounted() {
    AM_State.mode = 'animation';
    AM_State.init();
    AM_Core.init(this.$refs['scene'] as HTMLElement);

    const info = await AM_API.animation.getInfo(this.$route.params.resourceId as string);
    AM_State.animationInfo = info;

    await this.loadAnimation(info.name);
  },
  beforeUnmount() {
    AM_Core.destroy();
    AM_State.destroy();
  },
  methods: {
    async loadAnimation(name: string) {
      const animation = await AM_API.animation.get(name);
      AM_State.objectList
        .filter((x) => x instanceof AM_Character)
        .forEach((x) => {
          (x as AM_Character).resetPose();
        });
      AM_State.animationController.animationList = [{ offset: 0, animation }];
      AM_State.animationController.compile();
      AM_State.objectList
        .filter((x) => x instanceof AM_Character)
        .forEach((x) => {
          x.update();
        });
      AM_State.ui.refresh();
    },
  },
  data: () => {
    return {
      windowList: [
        /*{
          title: 'Animation list',
          name: 'animation-list',
          position: { x: 2, y: 5, width: 18, height: 20 },
        },*/
        {
          title: 'Character list',
          name: 'character-list',
          position: { x: 80, y: 5, width: 18, height: 20 },
        },
        {
          title: 'Project',
          name: 'project',
          position: { x: 80, y: 27, width: 18, height: 15 },
        },
        {
          title: 'Timeline',
          name: 'timeline',
          position: { x: 2, y: 70, width: 50, height: 25 },
        },
        {
          title: 'Shape',
          name: 'shape',
          position: { x: 54, y: 70, width: 15, height: 25 },
        },
      ],
    };
  },
});
</script>

<style lang="scss" scoped>
.main {
}
</style>
