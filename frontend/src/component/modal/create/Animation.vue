<template>
  <div :class="$style.clip">
    <desktop-ui-input v-model="$store.state.modal.data.name" placeholder="Name..." />
    <div class="button_group_round_compact">
      <desktop-ui-button @click="$store.dispatch('modal/close')" text="Close" />
      <desktop-ui-button @click="$store.dispatch('modal/ok')" text="Ok" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { AM_API } from '@/core/AM_API';

export default defineComponent({
  props: {},
  components: {},
  async mounted() {},
  methods: {
    async refresh() {},
  },
  data: () => {
    return {};
  },
});
</script>

<style lang="scss" module>
.clip {
  display: flex;
  flex-direction: column;
}
</style>
