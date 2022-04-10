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

export default defineComponent({
  components: {},
  async mounted() {
    AM_State.mode = 'clip';
    AM_State.init();
    AM_Core.init(this.$refs['scene'] as HTMLElement);
  },
  beforeUnmount() {
    AM_Core.destroy();
    AM_State.destroy();
  },
  methods: {},
  data: () => {
    return {
      windowList: [
        {
          title: 'Scene',
          name: 'scene',
          position: { x: 1, y: 5, width: 18, height: 20 },
        },
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
