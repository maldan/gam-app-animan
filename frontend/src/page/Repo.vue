<template>
  <div class="main">
    <ui-button @click="uploadModal" icon="arrow_up" text="Upload" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  components: {},
  async mounted() {
    await this.$store.dispatch('repo/getList');
  },
  methods: {
    uploadModal() {
      this.$store.dispatch('modal/show', {
        name: 'upload/virtual-object',
        data: {},
        onSuccess: () => {
          this.$store.dispatch('repo/upload');
        },
      });
    },
  },
  data: () => {
    return {};
  },
});
</script>

<style lang="scss" scoped>
.main {
}
</style>
