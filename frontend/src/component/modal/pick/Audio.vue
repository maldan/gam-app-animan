<template>
  <div :class="$style.audioList">
    <div :class="$style.list">
      <desktop-ui-button
        @click="
          $store.state.modal.data.resourceId = x.resourceId;
          $store.dispatch('modal/ok');
        "
        class="clickable"
        :class="$style.item"
        v-for="x in list"
        :key="x"
        :text="x.name"
      />
    </div>
    <desktop-ui-button @click="$store.dispatch('modal/close')" text="Close" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { AM_API } from '@/core/AM_API';
import { AM_IResourceInfo } from '@/core/AM_Type';

export default defineComponent({
  props: {},
  components: {},
  async mounted() {
    await this.refresh();
  },
  methods: {
    async refresh() {
      this.list = await AM_API.audio.getList();
    },
  },
  data: () => {
    return {
      list: [] as AM_IResourceInfo[],
    };
  },
});
</script>

<style lang="scss" module>
.audioList {
  display: flex;
  flex-direction: column;

  .list {
    display: flex;
    flex-direction: column;

    .item {
      margin-bottom: 2px;
    }
  }
}
</style>
