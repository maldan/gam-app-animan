<template>
  <div :class="$style.main">
    <div :class="$style.list">
      <div
        class="clickable"
        :class="$style.preview"
        v-for="x in $store.state.repo.objectList"
        :key="x.modelPath"
        @click="$router.push(`/preview/${x.name}`)"
      >
        <img :src="x.previewPath" alt="Preview" />
        <div :class="$style.title">{{ x.name }}</div>
      </div>
    </div>
    <ui-button @click="uploadModal" icon="arrow_up" text="Upload" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Repo } from '@/core/Repo';

export default defineComponent({
  components: {},
  async mounted() {
    await this.$store.dispatch('repo/getList');

    for (let i = 0; i < this.$store.state.repo.objectList.length; i++) {
      const obj = this.$store.state.repo.objectList[i];
      if (obj.previewPath !== '') return;

      const preview = await Repo.s(obj);
      await this.$store.dispatch('repo/uploadPreview', {
        name: obj.name,
        image: preview,
      });
    }
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

<style lang="scss" module>
.main {
  .list {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
    padding: 10px;

    .preview {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      background: #2b2b2b;
      padding: 15px;

      img {
        width: 100%;
      }

      .title {
        // margin-top: 15px;
        background: #222222;
        flex: 1;
        width: 100%;
        padding: 5px;
        box-sizing: border-box;
      }
    }
  }
}
</style>
