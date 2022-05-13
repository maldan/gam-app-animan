<template>
  <div :class="$style.objectList">
    <desktop-ui-input
      :class="$style.search"
      @change="refresh"
      placeholder="Filter..."
      v-model="search"
    />

    <!-- List -->
    <div :class="$style.categoryList">
      <div :class="$style.category" v-for="(v, k) in formattedList" :key="k">
        <div :class="$style.name">{{ k }}</div>

        <div :class="$style.list">
          <div
            @click="
              $store.state.modal.data.resourceId = x.resourceId;
              $store.state.modal.data.name = x.name;
              $store.dispatch('modal/ok');
            "
            class="clickable"
            :class="$style.item"
            v-for="x in v.list"
            :key="x.filePath"
          >
            <img :src="x.previewPath" alt="" />
            <div :class="$style.name">{{ x.name }}</div>
          </div>
        </div>
      </div>
    </div>

    <desktop-ui-button :class="$style.close" @click="$store.dispatch('modal/close')" text="Close" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { AM_API } from '@/core/AM_API';
import { AM_IResourceInfo } from '@/core/AM_Type';

export default defineComponent({
  props: {},
  components: {},
  computed: {
    filteredList() {
      if (!this.search) return this.list;
      return this.list.filter((x) => x.name.match(this.search));
    },
    formattedList() {
      const categories = {} as Record<string, { list: Partial<AM_IResourceInfo>[] }>;

      categories['light'] = {
        list: [
          {
            resourceId: 'directionalLight',
            name: 'directionalLight',
            category: 'light',
          },
        ],
      };

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
.objectList {
  display: flex;
  flex-direction: column;
  max-width: 720px;

  .categoryList {
    display: flex;
    flex-direction: column;

    .category {
      margin-bottom: 5px;

      .name {
        background: #1b1b1b;
        padding: 2px 5px;
        font-size: 12px;
        margin-bottom: 5px;
      }
    }
  }

  .list {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 10px;

    .item {
      background: #1b1b1b;
      padding: 5px;
      font-size: 12px;
      border-radius: 4px;
      text-align: center;

      .name {
        margin-top: 4px;
      }

      img {
        width: 100%;
        display: block;
      }
    }
  }

  .search {
    margin-bottom: 10px;
  }

  .close {
    margin-top: 10px;
  }
}
</style>
