<template>
  <div :class="$style.main">
    <desktop-ui-button @click="create" icon="plus" text="New" />

    <div :class="$style.list">
      <div
        class="clickable"
        :class="$style.preview"
        v-for="x in list"
        :key="x.clipPath"
        @click="$router.push(`/clip/${x.resourceId}`)"
      >
        <img :src="x.previewPath" alt="Preview" />
        <div :class="$style.title">{{ x.name }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { AM_Preview } from '@/core/AM_Preview';
import { AM_API } from '@/core/AM_API';
import { AM_IClip, AM_IResourceInfo } from '@/core/AM_Type';

export default defineComponent({
  components: {},
  async mounted() {
    await this.refresh();
  },
  methods: {
    async refresh() {
      this.list = await AM_API.getClipList();
      /*for (let i = 0; i < this.list.length; i++) {
        const obj = this.list[i];
        if (obj.previewPath !== '') continue;
        const preview = await AM_Preview.getPreview(obj);

        await AM_API.uploadObjectPreview(obj.category + '/' + obj.name, preview);
        obj.previewPath = obj.modelPath.replace(/\/[a-zA-Z0-9_]+\.glb$/, '/preview.jpg');
      }*/
    },
    create() {
      this.$store.dispatch('modal/show', {
        name: 'create/clip',
        data: {
          name: '',
        },
        onSuccess: async () => {
          const info = await AM_API.createClip(this.$store.state.modal.data.name);
          await this.$router.push(`/clip/${info.resourceId}`);
        },
      });
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
.main {
  padding: 10px;

  .list {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
    margin-top: 10px;

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
