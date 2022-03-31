<template>
  <ui-header :items="menu" style="position: relative; z-index: 2" />
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
      menu: [
        //{ name: 'Animation', url: '/' },
        { name: 'Character Animation', url: '/character-animation' },
        //{ name: 'Clip', url: '/clip' },
        //{ name: 'Repo', url: '/repo' },
        // { name: 'Scene', url: '/scene' },
      ],
    };
  },
});
</script>

<style lang="scss" scoped></style>
