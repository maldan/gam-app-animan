<template>
  <div :class="$style.main">
    <desktop-ui-input
      :class="$style.search"
      @change="refresh"
      placeholder="Filter..."
      v-model="search"
    />

    <!-- List -->
    <!-- <div :class="$style.list">
     <div
       class="clickable"
       :class="$style.preview"
       v-for="x in list"
       :key="x.filePath"
       @click="$router.push(`/object/${x.resourceId}`)"
     >
       <img :src="x.previewPath" alt="Preview" />
       <div :class="$style.title">{{ x.name }}</div>
     </div>
   </div>-->

    <!-- List -->
    <div :class="$style.categoryList">
      <div :class="$style.category" v-for="(v, k) in formattedList" :key="k">
        <div :class="$style.name">{{ k }}</div>

        <div :class="$style.list">
          <div
            class="clickable"
            :class="$style.item"
            v-for="x in v.list"
            :key="x.filePath"
            @click="$router.push(`/object/${x.resourceId}`)"
          >
            <img :src="x.previewPath" alt="" />
            <div :class="$style.title">{{ x.name }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { AM_Preview } from '@/core/AM_Preview';
import { AM_API } from '@/core/AM_API';
import { AM_IResourceInfo } from '@/core/AM_Type';

export default defineComponent({
  components: {},
  computed: {
    filteredList() {
      if (!this.search) return this.list;
      return this.list.filter((x) => x.name.match(this.search));
    },
    formattedList() {
      const categories = {} as Record<string, { list: Partial<AM_IResourceInfo>[] }>;

      for (let i = 0; i < this.filteredList.length; i++) {
        if (!categories[this.filteredList[i].category]) {
          categories[this.filteredList[i].category] = {
            list: [],
          };
        }
        categories[this.filteredList[i].category].list.push(this.filteredList[i]);
      }
      return categories;
    },
  },
  async mounted() {
    await this.refresh();
  },
  methods: {
    async refresh() {
      this.list = await AM_API.getObjectList();
      for (let i = 0; i < this.list.length; i++) {
        const obj = this.list[i];
        if (obj.previewPath !== '') continue;
        const preview = await AM_Preview.getPreview(obj);

        await AM_API.uploadObjectPreview(obj.category + '/' + obj.name, preview);
        obj.previewPath = obj.filePath.replace(/\/[a-zA-Z0-9_]+\.glb$/, '/preview.jpg');
      }
    },
    uploadModal() {
      this.$store.dispatch('modal/show', {
        name: 'upload/virtual-object',
        data: {},
        onSuccess: async () => {
          await this.$store.dispatch('repo/upload');
          window.location.reload();
        },
      });
    },
  },
  data: () => {
    return {
      search: '',
      list: [] as AM_IResourceInfo[],
    };
  },
});
</script>

<style lang="scss" module>
.main {
  padding: 10px;

  .categoryList {
    display: flex;
    flex-direction: column;
    margin-top: 10px;

    .category {
      margin-bottom: 5px;

      .name {
        background: #1b1b1b;
        padding: 4px 8px;
        font-size: 14px;
        margin-bottom: 5px;
      }
    }
  }

  .list {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 10px;

    .item {
      background: #1b1b1b;
      padding: 10px;
      font-size: 12px;
      border-radius: 0;
      text-align: center;

      .title {
        margin-top: 10px;
        padding: 0;
      }

      img {
        width: 100%;
        display: block;
      }
    }
  }
}
</style>
