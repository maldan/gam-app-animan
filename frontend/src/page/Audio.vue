<template>
  <div :class="$style.main">
    <!-- <div :class="$style.list">
      <div :class="$style.audio" v-for="x in list" :key="x.filePath">
        <div>
          <div :class="$style.title">{{ x.category }}</div>
          <div :class="$style.title">{{ x.name }}</div>
        </div>
        <desktop-ui-button
          :class="$style.button"
          @click="togglePlay(x.filePath)"
          :text="isPlay(x.filePath) ? 'Pause' : 'Play'"
        />
      </div>
    </div> -->

    <!-- List -->
    <div :class="$style.categoryList">
      <div :class="$style.category" v-for="(v, k) in formattedList" :key="k">
        <div :class="$style.name">
          <div v-for="x in k.split('/')" :key="x">{{ x }}</div>
        </div>

        <div :class="$style.list">
          <div :class="$style.item" v-for="x in v.list" :key="x.filePath">
            <div :class="$style.title">{{ x.name }}</div>
            <desktop-ui-button
              :class="$style.play"
              @click="togglePlay(x.filePath)"
              :text="isPlay(x.filePath) ? 'Pause' : 'Play'"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
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
      this.list = await AM_API.getAudioList();
    },
    isPlay(url: string) {
      if (!this.audioCache[url]) return false;
      return !(this.audioCache[url].ended || this.audioCache[url].paused);
    },
    togglePlay(url: string) {
      if (this.audioCache[url]) {
        if (this.audioCache[url].paused) this.audioCache[url].play();
        else this.audioCache[url].pause();
        return;
      }
      this.audioCache[url] = new Audio(url);
      this.audioCache[url].play();
    },
    uploadModal() {
      this.$store.dispatch('modal/show', {
        name: 'upload/audio',
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
      audioCache: {} as Record<string, HTMLAudioElement>,
      category: '',
    };
  },
});
</script>

<style lang="scss" module>
@import 'src/gam_sdk_ui/vue/style/color';
@import 'src/gam_sdk_ui/vue/style/size';

/*.main {
  padding: 10px;

  .list {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 10px;
    margin-top: 10px;

    .audio {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #2b2b2b;
      padding: 10px;

      .button {
        flex: none;
        margin-left: auto;
      }
    }
  }
}*/

.main {
  padding: 10px;

  .categoryList {
    display: flex;
    flex-direction: column;
    margin-top: 10px;

    .category {
      margin-bottom: 5px;
      background: #1b1b1b;
      padding: 5px;

      .name {
        // background: lighten(#1b1b1b, 10%);
        padding: 5px;
        font-size: 12px;
        margin-bottom: 5px;
        display: flex;

        > div {
          background: #108e04;
          margin-right: 5px;
          border-radius: 4px;
          padding: 2px 5px;
        }
      }
    }
  }

  .list {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 10px;

    .item {
      background: lighten(#1b1b1b, 7%);
      padding: 5px;
      font-size: 14px;
      border-radius: 0;
      display: flex;
      align-items: center;
      color: $text-gray;

      .title {
        padding-left: 5px;
      }

      .play {
        flex: none;
        margin-left: auto;
        padding: 2px 5px;
      }
    }
  }
}
</style>
