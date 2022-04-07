<template>
  <div :class="$style.main">
    <div :class="$style.list">
      <div :class="$style.preview" v-for="x in list" :key="x.audioPath">
        <div :class="$style.title">{{ x.name }}</div>
        <desktop-ui-button
          @click="togglePlay(x.audioPath)"
          :text="isPlay(x.audioPath) ? 'Pause' : 'Play'"
        />
      </div>
    </div>
    <desktop-ui-button @click="uploadModal" icon="arrow_up" text="Upload" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { AM_API } from '@/core/AM_API';
import { AM_IAudioInfo } from '@/core/am/AM_Object';

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
      return !this.audioCache[url].paused;
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
      list: [] as AM_IAudioInfo[],
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
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
    // padding: 10px;

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
