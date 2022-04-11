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
    AM_State.mode = 'pose';
    AM_State.init();
    AM_Core.init(this.$refs['scene'] as HTMLElement);

    const info = await AM_API.pose.getInfo(this.$route.params.resourceId as string);
    AM_State.poseInfo = info;

    await this.loadPose(info.name);
  },
  beforeUnmount() {
    AM_Core.destroy();
    AM_State.destroy();
  },
  methods: {
    async loadPose(name: string) {
      const pose = await AM_API.pose.get(name);
      console.log(pose);
      AM_State.ui.refresh();
    },
  },
  data: () => {
    return {
      windowList: [
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
          title: 'Shape',
          name: 'shape',
          position: { x: 80, y: 44, width: 18, height: 25 },
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
