<template>
  <div :class="$style.scene">1</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {},
  components: {},
  async mounted() {},
  methods: {},
  data: () => {
    return {};
  },
});
</script>

<style lang="scss" module>
.scene {
  display: flex;
  flex-direction: column;
}
</style>
