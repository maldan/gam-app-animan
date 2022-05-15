<template>
  <div :class="$style.main">
    <div ref="scene"></div>
    <div ref="logs" style="position: absolute; left: 50px; top: 50px"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { AM_Preview } from '@/core/AM_Preview';

export default defineComponent({
  components: {},
  computed: {},
  async mounted() {
    await AM_Preview.initXR(this.$refs['scene'] as HTMLElement, this.$refs['logs'] as HTMLElement);
  },
  methods: {},
  data: () => {
    return {};
  },
});
</script>

<style lang="scss" module>
@import 'src/gam_sdk_ui/vue/style/color';
@import 'src/gam_sdk_ui/vue/style/size';

.main {
  padding: 10px;
}
</style>
