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

    <!-- Timeline list -->
    <desktop-ui-window
      v-for="x in s"
      :key="x.name"
      :title="x.title"
      :initData="x.position"
      :id="x.id"
      @focus="$refs[`timeline-${x.id}`]?.[0]?.onFocus()"
      @blur="$refs[`timeline-${x.id}`]?.[0]?.onBlur()"
    >
      <template v-slot:header style="display: flex; align-items: center">
        <div>{{ x.title }} {{ $refs[`timeline-${x.id}`]?.[0]?.isFocus ? '*' : '' }}</div>
        <desktop-ui-button
          @click="closeTimeline(x.selectedObject)"
          text="X"
          style="margin-left: auto; flex: none"
        />
      </template>
      <template v-slot:body>
        <timeline :ref="`timeline-${x.id}`" :selected-object="x.selectedObject" />
      </template>
    </desktop-ui-window>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { AM_Core } from '@/core/AM_Core';
import { AM_State } from '@/core/AM_State';
import { AM_API } from '@/core/AM_API';
import { AM_Object } from '@/core/am/AM_Object';

export default defineComponent({
  components: {},
  computed: {
    s() {
      if (this.r < 0) return [];
      return AM_State.animationObjectList.map((x) => {
        return {
          id: 'timeline-win-' + x.id,
          title: `Timeline ${x.name}`,
          name: 'timeline',
          selectedObject: x,
          position: { x: 1, y: 74, width: 50, height: 25 },
        };
      });
    },
  },
  async mounted() {
    AM_State.mode = 'clip';
    AM_State.init();
    AM_Core.init(this.$refs['scene'] as HTMLElement);

    // Clip editor
    AM_State.ui.clipEditor.ref = this;
    AM_State.ui.clipEditor.refresh();

    const info = await AM_API.getClipInfo(this.$route.params.resourceId as string);
    AM_State.clipInfo = info;
    await this.loadClip(info.name);

    // @ts-ignore
    this.$root.projectName = info.name;
  },
  beforeUnmount() {
    AM_Core.destroy();
    AM_State.destroy();
  },
  methods: {
    refresh() {
      this.r = Math.random();
    },
    closeTimeline(x: AM_Object) {
      AM_State.removeAnimationObject(x);
    },
    async loadClip(name: string) {
      const clip = await AM_API.getClip(name);

      for (let i = 0; i < clip.objectList.length; i++) {
        const objectInfo = await AM_API.object.getInfo(clip.objectList[i].resourceId);
        const obj = await AM_State.loadObject(
          objectInfo.filePath,
          objectInfo.category === 'character' ? 'character' : '',
        );
        obj.id = clip.objectList[i].id;
        obj.resourceId = clip.objectList[i].resourceId;
        obj.name = clip.objectList[i].name;

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
      r: 0,
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
        /*{
          title: 'Timeline',
          name: 'timeline',
          position: { x: 1, y: 74, width: 50, height: 25 },
        },*/
        /*{
          title: 'Shape',
          name: 'shape',
          position: { x: 52, y: 74, width: 15, height: 25 },
        },*/
      ],
    };
  },
});
</script>

<style lang="scss" scoped>
.main {
}
</style>
