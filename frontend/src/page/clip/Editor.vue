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

export default defineComponent({
  components: {},
  async mounted() {
    AM_State.mode = 'clip';
    AM_State.init();
    AM_Core.init(this.$refs['scene'] as HTMLElement);

    const info = await AM_API.getClipInfo(this.$route.params.resourceId as string);
    AM_State.clipInfo = info;
    await this.loadClip(info.name);
  },
  beforeUnmount() {
    AM_Core.destroy();
    AM_State.destroy();
  },
  methods: {
    async loadClip(name: string) {
      const clip = await AM_API.getClip(name);

      for (let i = 0; i < clip.objectList.length; i++) {
        const objectInfo = await AM_API.getObject(clip.objectList[i].resourceId);
        const obj = await AM_State.loadObject(
          objectInfo.modelPath,
          objectInfo.category === 'character' ? 'character' : '',
        );
        obj.id = clip.objectList[i].id;
        obj.resourceId = clip.objectList[i].resourceId;

        obj.position = clip.objectList[i].position;
        obj.rotation = clip.objectList[i].rotation;
        // obj.scale = objectInfo.scale;
        AM_State.addObject(obj);
        obj.update();
      }

      for (let i = 0; i < clip.animationList.length; i++) {
        const obj = AM_State.objectList.find((x) => x.id === clip.animationList[i].objectId);
        if (!obj) continue;
        obj.animationController.animationList.length = 0;

        clip.animationList[i].animationList?.forEach((x) => {
          const animation = AM_API.animation.fromJSON(x.animation);
          obj.animationController.appendAnimation(animation, x.offset);
        });
        obj.animationController.compile();
        obj.applyAnimation(obj.animationController.animation);
      }
    },
  },
  data: () => {
    return {
      windowList: [
        {
          title: 'Project',
          name: 'project',
          position: { x: 80, y: 5, width: 18, height: 15 },
        },
        {
          title: 'Scene',
          name: 'scene',
          position: { x: 1, y: 5, width: 18, height: 20 },
        },
        /*{
          title: 'Clip List',
          name: 'clip-list',
          position: { x: 1, y: 27, width: 18, height: 20 },
        },*/
        {
          title: 'Timeline',
          name: 'timeline',
          position: { x: 1, y: 74, width: 50, height: 25 },
        },
        {
          title: 'Shape',
          name: 'shape',
          position: { x: 52, y: 74, width: 15, height: 25 },
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
