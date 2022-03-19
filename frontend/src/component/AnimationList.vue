<template>
  <div :class="$style.animationList">
    <ui-button v-for="item in list" :key="item" :text="item" />

    <ui-button @click="$store.dispatch('scene/createAnimation')" text="Create" />
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
    return {
      list: ['Coco'],
    };
  },
});
</script>

<style lang="scss" module>
.animationList {
  display: flex;
  flex-direction: column;
}
</style>
