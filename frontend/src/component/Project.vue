<template>
  <div :class="$style.project">
    <!-- Animation -->
    <div v-if="!isLoading && mode === 'animation'" :class="$style.panel">
      <desktop-ui-button
        @click="saveAnimation"
        v-if="animationList && animationList[0]?.animation.name"
        text="Save animation"
        style="margin-bottom: 5px"
      />
      <desktop-ui-button @click="togglePlay" :text="isAnimationPlay ? 'Stop' : 'Play'" />
    </div>

    <!-- Clip -->
    <div v-if="!isLoading && mode === 'clip'" :class="$style.panel">
      <div>Clip name: {{ clipInfo?.name }}</div>
      <desktop-ui-button @click="saveClip" text="Save" style="margin-bottom: 5px" />
      <desktop-ui-button @click="togglePlay" :text="isAnimationPlay ? 'Stop' : 'Play'" />
    </div>

    <div v-if="isLoading">...</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { AM_State } from '@/core/AM_State';
import { AM_AnimationController, AM_IAnimationPart } from '@/core/animation/AM_AnimationController';
import { AM_Object } from '@/core/am/AM_Object';
import { AM_Bone } from '@/core/am/AM_Bone';
import { AM_API } from '@/core/AM_API';
import { AM_IClipInfo } from '@/core/AM_Type';

export default defineComponent({
  props: {},
  components: {},
  computed: {
    selectedObject(): AM_Object | undefined {
      if (this.r < 0) return undefined;
      if (AM_State.selectedObject instanceof AM_Bone) return AM_State.selectedObject.parent;
      return AM_State.selectedObject;
    },
    animationController(): AM_AnimationController | undefined {
      if (this.r < 0) return undefined;
      return this.selectedObject?.animationController;
    },
    animationList(): AM_IAnimationPart[] {
      if (this.r < 0) return [];
      return this.animationController?.animationList || [];
    },
    isAnimationPlay(): boolean {
      if (this.r < 0) return false;
      return AM_State.isAnimationPlay;
    },
    mode(): string {
      if (this.r < 0) return '';
      return AM_State.mode;
    },
    clipInfo(): AM_IClipInfo | undefined {
      if (this.r < 0) return undefined;
      return AM_State.clipInfo;
    },
  },
  async mounted() {
    AM_State.ui.project.ref = this;
    AM_State.ui.project.refresh();
  },
  methods: {
    refresh() {
      this.r = Math.random();
    },
    togglePlay() {
      AM_State.isAnimationPlay = !AM_State.isAnimationPlay;
      this.refresh();
    },
    async saveClip(): Promise<void> {
      if (!AM_State.clipInfo) return;

      this.isLoading = true;
      await AM_API.saveClip(
        AM_State.clipInfo.name,
        AM_State.objectList.filter((x) => !(x instanceof AM_Bone)),
      );
      this.isLoading = false;
    },
    async saveAnimation(): Promise<void> {
      if (this.animationController && this.animationController.animationList.length) {
        this.animationController.compile();
        await AM_API.saveAnimation(
          this.animationController.animationList[0].animation.name,
          this.animationController.animation,
        );
      }
    },
  },
  data: () => {
    return {
      r: 0,
      isLoading: false,
    };
  },
});
</script>

<style lang="scss" module>
.project {
  display: flex;
  flex-direction: column;
  font-size: 14px;
  user-select: none;

  .panel {
    display: flex;
    flex-direction: column;
  }
}
</style>
