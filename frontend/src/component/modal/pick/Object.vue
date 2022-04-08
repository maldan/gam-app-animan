<template>
  <div :class="$style.objectList">
    <ui-input @change="refresh" placeholder="Search..." v-model="search" />
    <div :class="$style.list">
      <div
        @click="
          $store.state.modal.data.uuid = x.uuid;
          $store.dispatch('modal/ok');
        "
        class="clickable"
        :class="$style.item"
        v-for="x in list"
        :key="x.modelPath"
      >
        <img :src="x.previewPath" alt="" />
        <div>{{ x.name }}</div>
      </div>
    </div>
    <desktop-ui-button @click="$store.dispatch('modal/close')" text="Close" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { AM_API } from '@/core/AM_API';
import { AM_IObjectInfo } from '@/core/am/AM_Object';

export default defineComponent({
  props: {},
  components: {},
  async mounted() {
    await this.refresh();
  },
  methods: {
    async refresh() {
      this.list = await AM_API.getObjectList();
    },
  },
  data: () => {
    return {
      search: 'character',
      list: [] as AM_IObjectInfo[],
    };
  },
});
</script>

<style lang="scss" module>
.objectList {
  display: flex;
  flex-direction: column;
  max-width: 720px;

  .list {
    display: grid;
    grid-template-columns: repeat(4, 1fr);

    .item {
      img {
        width: 100%;
      }
    }
  }
}
</style>
