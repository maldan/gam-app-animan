<template>
  <div class="main">
    <ui-window title="Animation list"></ui-window>
    <ui-window title="Event list"></ui-window>
    <ui-window title="Character list"></ui-window>
    <ui-window title="Pose list"></ui-window>
    <ui-window title="Blend Shape"></ui-window>

    <ui-window title="Timeline" :x="100" :y="200" :width="480" :height="240">
      <template v-slot:body>
        <timeline />
      </template>
    </ui-window>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  components: {},
  async mounted() {},
  methods: {},
  data: () => {
    return {};
  },
});
</script>

<style lang="scss" scoped>
.main {
}
</style>
