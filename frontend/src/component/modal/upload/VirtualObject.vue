<template>
  <div :class="$style.virtualObject">
    <div>Name</div>
    <ui-input v-model="$store.state.modal.data.name" />

    <div>Model fbx</div>
    <ui-input type="file" accept=".fbx" v-model="$store.state.modal.data.model" />

    <div class="button_group" style="margin-top: 10px">
      <ui-button @click="$store.dispatch('modal/close')" text="Cancel" />
      <ui-button @click="$store.dispatch('modal/ok')" text="Upload" />
    </div>
  </div>
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
.virtualObject {
}
</style>
