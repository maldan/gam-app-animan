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
import { AM_Character } from '@/core/object/AM_Character';
import { AM_IPose, AM_KeyHelper } from '@/core/AM_Type';

export default defineComponent({
  components: {},
  async mounted() {
    AM_State.mode = 'pose';
    AM_State.init();
    AM_Core.init(this.$refs['scene'] as HTMLElement);

    const info = await AM_API.pose.getInfo(this.$route.params.resourceId as string);
    AM_State.poseInfo = info;

    await this.loadPose(info.name);

    AM_State.on('addObject', (ch: unknown) => {
      if (!this.pose) return;
      if (ch instanceof AM_Character) {
        for (let i = 0; i < this.pose.keys.length; i++) {
          ch.applyKey(AM_KeyHelper.fromJSON(this.pose.keys[i]));
        }

        // Set default animation
        ch.animationController.createAnimation(0);
        ch.animationController.workingOnAnimationPart = ch.animationController.animationList[0];
        ch.animationController.compile();
      }
    });
  },
  beforeUnmount() {
    AM_Core.destroy();
    AM_State.destroy();
  },
  methods: {
    async loadPose(name: string) {
      this.pose = await AM_API.pose.get(name);
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
      pose: undefined as AM_IPose | undefined,
    };
  },
});
</script>

<style lang="scss" scoped>
.main {
}
</style>
