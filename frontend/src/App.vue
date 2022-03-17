<template>
  <router-view />
  <ui-modal-view />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  components: {},
  async mounted() {},
  methods: {},
  data: () => {
    return {
      // @ts-ignore
      API_URL: process.env.VUE_APP_API_URL || `${window.location.origin}/api`,
      console: console,
    };
  },
});
</script>

<style lang="scss" scoped></style>
