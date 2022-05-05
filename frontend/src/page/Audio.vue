<template>
  <div :class="$style.main">
    <desktop-ui-button @click="uploadModal" icon="arrow_up" text="Upload" />

    <div :class="$style.list">
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
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { AM_API } from '@/core/AM_API';
import { AM_IResourceInfo } from '@/core/AM_Type';

export default defineComponent({
  components: {},
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
      list: [] as AM_IResourceInfo[],
      audioCache: {} as Record<string, HTMLAudioElement>,
      category: '',
    };
  },
});
</script>

<style lang="scss" module>
.main {
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
}
</style>
