<template>
  <div :class="$style.animationList"></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { MainScene } from '@/core/MainScene';
import { Animation_Sequence } from '@/core/animation/Animation_Sequence';
import { Animation_Character } from '@/core/Animation_Character';

export default defineComponent({
  props: {},
  components: {},
  computed: {
    character(): Animation_Character | undefined {
      if (this.r < 0) return undefined;
      return MainScene.selectedObject?.userData?.class;
    },
  },
  async mounted() {
    await this.$store.dispatch('animation/getList');

    MainScene.ui.main.refresh();
    MainScene.ui.scene.refresh();
  },
  methods: {
    createAnimation() {
      if (MainScene.selectedObject?.userData?.tag === 'Character') {
        MainScene.selectedObject.userData.class.animation = new Animation_Sequence({
          frameCount: 48,
        });
        MainScene.ui.timeline.refresh();
        MainScene.ui.main.refresh();
        this.isNewAnimation = true;
      }
    },
    saveAnimation() {
      this.$store.dispatch('animation/save', {
        name: this.animationName,
        data: JSON.stringify(this.character?.animation),
      });
    },
  },
  data: () => {
    return {
      isNewAnimation: false,
      animationName: '',
      r: 0,
    };
  },
});
</script>

<style lang="scss" module>
.animationList {
  display: flex;
  flex-direction: column;

  .new {
    display: flex;

    .input {
      flex: 1;
    }

    .button {
      flex: none;
      padding: 5px;
    }
  }
}
</style>
