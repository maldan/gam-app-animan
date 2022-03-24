<template>
  <div :class="$style.main">
    <ui-button-group :items="items" v-model="category" @change="refresh" />

    <div :class="$style.list">
      <div
        class="clickable"
        :class="$style.preview"
        v-for="x in $store.state.repo.objectList"
        :key="x.modelPath"
        @click="$router.push(`/preview/${x.category}/${x.name}`)"
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
    await this.refresh();
  },
  methods: {
    async refresh() {
      await this.$store.dispatch('repo/getList', this.category);

      for (let i = 0; i < this.$store.state.repo.objectList.length; i++) {
        const obj = this.$store.state.repo.objectList[i];
        if (obj.previewPath !== '') continue;

        const preview = await Repo.getPreview(obj);
        await this.$store.dispatch('repo/uploadPreview', {
          name: obj.name,
          category: obj.category,
          image: preview,
        });

        this.$store.state.repo.objectList[i].previewPath = this.$store.state.repo.objectList[
          i
        ].modelPath.replace(/\/[a-zA-Z0-9_]+\.fbx$/, '/preview.jpg');
      }
    },
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
    return {
      category: '',
      items: [
        {
          text: 'Character',
          id: 'character',
        },
        {
          text: 'Nature',
          id: 'nature',
        },
      ],
    };
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
