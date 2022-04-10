<template>
  <div :class="$style.project">
    <desktop-ui-button
      @click="saveAnimation"
      v-if="animationList && animationList[0]?.animation.name"
      text="Save animation"
      style="margin-bottom: 5px"
    />
    <desktop-ui-button @click="togglePlay" :text="isAnimationPlay ? 'Stop' : 'Play'" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { AM_State } from '@/core/AM_State';
import { AM_AnimationController, AM_IAnimationPart } from '@/core/animation/AM_AnimationController';
import { AM_Object } from '@/core/am/AM_Object';
import { AM_Bone } from '@/core/am/AM_Bone';
import { AM_API } from '@/core/AM_API';

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
}
</style>
