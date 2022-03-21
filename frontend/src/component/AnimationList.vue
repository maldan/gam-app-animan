<template>
  <div :class="$style.animationList">
    <ui-button v-for="item in list" :key="item" :text="item" />

    <ui-button @click="createAnimation()" text="Create" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { MainScene } from '@/core/MainScene';
import { Animation_Sequence } from '@/core/Animation_Sequence';

export default defineComponent({
  props: {},
  components: {},
  async mounted() {},
  methods: {
    createAnimation() {
      if (MainScene.selectedObject?.userData?.tag === 'Character') {
        MainScene.selectedObject.userData.class.animation = new Animation_Sequence({
          frameCount: 48,
        });
        MainScene.ui.timeline.refresh();
        console.log(2);
      }
    },
  },
  data: () => {
    return {
      list: ['Coco'],
    };
  },
});
</script>

<style lang="scss" module>
.animationList {
  display: flex;
  flex-direction: column;
}
</style>
