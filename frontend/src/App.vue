<template>
  <ui-header :items="menu" style="position: relative; z-index: 2" :by-match="true">
    <template v-slot:content>{{ projectName }}</template>
  </ui-header>
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
        { name: 'Animation', url: '/animation' },
        { name: 'Clip', url: '/clip' },
        { name: 'Object', url: '/object' },
        { name: 'Pose', url: '/pose' },
        { name: 'Audio', url: '/audio' },
      ],
      projectName: '',
    };
  },
});
</script>

<style lang="scss" scoped></style>
