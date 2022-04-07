<template>
  <div :class="$style.audio">
    <!-- Name -->
    <div>Name</div>
    <desktop-ui-input v-model="name" />

    <!-- Category -->
    <div>Category</div>
    <ui-select v-model="category" :items="categoryList" />

    <!-- MP3 -->
    <div>MP3</div>
    <ui-input type="file" accept=".mp3" v-model="file" />

    <div class="button_group_round_compact">
      <desktop-ui-button @click="$store.dispatch('modal/close')" text="Close" />
      <desktop-ui-button @click="upload" text="Upload" icon="arrow_up" />
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
    async upload() {
      await AM_API.uploadAudio(this.name, this.category.value, this.file[0]);
      await this.$store.dispatch('modal/close');
    },
  },
  data: () => {
    return {
      name: '',
      category: { label: '', value: '' },
      categoryList: [{ label: 'Sex', value: 'sex' }],
      file: null as any,
    };
  },
});
</script>

<style lang="scss" module>
.audio {
  display: flex;
  flex-direction: column;
}
</style>
