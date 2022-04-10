<template>
  <div :class="$style.main">
    <div ref="scene"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { AM_Preview } from '@/core/AM_Preview';
import { AM_API } from '@/core/AM_API';

export default defineComponent({
  components: {},
  async mounted() {
    const objectInfo = await AM_API.getObject(this.$route.params['resourceId'] as string);
    await AM_Preview.init(this.$refs['scene'] as HTMLElement, objectInfo.modelPath);
  },
  methods: {},
  data: () => {
    return {};
  },
});
</script>

<style lang="scss" module>
.main {
  padding: 10px;
}
</style>
