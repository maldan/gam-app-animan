<template>
  <div class="main">
    <div ref="scene"></div>

    <!-- Window list -->
    <ui-window v-for="x in windowList" :key="x.name" :title="x.title" :initData="x.position">
      <template v-slot:body>
        <component :is="x.name" />
      </template>
    </ui-window>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Core } from '@/core/Core';

export default defineComponent({
  components: {},
  async mounted() {
    Core.init(this.$refs['scene'] as HTMLElement);
  },
  methods: {},
  data: () => {
    return {
      windowList: [
        {
          title: 'Character list',
          name: 'character-list',
          position: { x: 80, y: 5, width: 18, height: 20 },
        },
        {
          title: 'Scene',
          name: 'scene',
          position: { x: 2, y: 30, width: 15, height: 20 },
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
