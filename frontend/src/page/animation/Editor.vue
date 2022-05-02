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

    <!-- Timeline -->
    <desktop-ui-window
      title="Timeline"
      :initData="{ x: 2, y: 70, width: 50, height: 28 }"
      @focus="$refs[`timeline`]?.[0]?.onFocus()"
      @blur="$refs[`timeline`]?.[0]?.onBlur()"
    >
      <template v-slot:header style="display: flex; align-items: center">
        <div>Timeline</div>
      </template>
      <template v-slot:body>
        <timeline :ref="`timeline`" :selected-object="selectedObject" />
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
  computed: {
    selectedObject() {
      if (this.r < 0) return undefined;
      return AM_State.animationObjectList[0];
    },
  },
  async mounted() {
    AM_State.mode = 'animation';
    AM_State.init();
    AM_Core.init(this.$refs['scene'] as HTMLElement);

    const info = await AM_API.animation.getInfo(this.$route.params.resourceId as string);
    AM_State.animationInfo = info;

    await this.loadAnimation(info.name);

    AM_State.on('addObject', (ch: unknown) => {
      if (ch instanceof AM_Character) {
        AM_State.animationObjectList.length = 0;
        AM_State.addAnimationObject(ch);
        AM_State.ui.refresh();
        this.refresh();
      }
    });

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
    async loadAnimation(name: string) {
      const animation = await AM_API.animation.get(name);
      AM_State.objectList
        .filter((x) => x instanceof AM_Character)
        .forEach((x) => {
          (x as AM_Character).resetPose();
        });
      AM_State.animationController.animationList = [{ offset: 0, repeat: 1, animation }];
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
      r: 0,
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
        /*{
          title: 'Timeline',
          name: 'timeline',
          position: { x: 2, y: 70, width: 50, height: 25 },
        },*/
        /*{
          title: 'Shape',
          name: 'shape',
          position: { x: 54, y: 70, width: 15, height: 25 },
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
