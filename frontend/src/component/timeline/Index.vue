<template>
  <div v-if="animationController" :class="$style.timeline">
    <timeline-controller
      ref="controller"
      v-if="!animation"
      :selected-object="selectedObject"
      :is-focus="isFocus"
    />
    <timeline-animation
      ref="animation"
      v-if="animation"
      :selected-object="selectedObject"
      :is-focus="isFocus"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { AM_State } from '@/core/AM_State';
import { AM_AnimationController } from '@/core/animation/AM_AnimationController';
import { AM_Animation } from '@/core/animation/AM_Animation';

export default defineComponent({
  props: {
    selectedObject: Object,
  },
  components: {},
  computed: {
    animationController(): AM_AnimationController | undefined {
      if (this.r < 0) return undefined;
      return this.selectedObject?.animationController;
    },
    animation(): AM_Animation | undefined {
      if (this.r < 0) return undefined;
      return this.animationController?.workingOnAnimationPart?.animation;
    },
  },
  async mounted() {
    AM_State.ui.timeline.addRef(this);
    AM_State.ui.timeline.refresh();
  },
  beforeUnmount() {},
  methods: {
    refresh() {
      this.r = Math.random();

      // @ts-ignore
      this.$refs['controller']?.refresh();
      // @ts-ignore
      this.$refs['animation']?.refresh();
    },
    onFocus() {
      this.isFocus = true;
    },
    onBlur() {
      this.isFocus = false;
    },
  },
  data: () => {
    return {
      r: 0,
      editMode: 'controller',
      isFocus: false,
    };
  },
});
</script>

<style lang="scss" module>
@import 'src/gam_sdk_ui/vue/style/color';
@import 'src/gam_sdk_ui/vue/style/size';

.timeline {
  .controller,
  .animation {
    .left {
      .numbers {
        font-size: 12px;
        color: $text-gray;
        margin-bottom: 3px;

        .keys {
          .key {
            background: none;
          }
        }
      }
    }
  }

  .controller {
    display: flex;

    .animationPart {
      height: 24px;
      background: #9a6927;
      // margin-bottom: 5px;
      position: relative;
      border: 1px solid #fefefe00;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      font-size: 14px;
      padding-left: 5px;

      &.selected {
        border: 1px solid #eca824;
      }
    }

    .left {
      flex: 1;
    }

    .right {
      width: 200px;
    }
  }

  .line {
    display: flex;
    margin-bottom: 1px;
    min-height: 16px;

    /*.numbers {
      width: 8px;
      font-size: 12px;
      color: $text-gray;
      margin-right: 1px;
    }*/

    .name {
      width: 128px;
      font-size: 14px;
      color: $text-gray;
      background: lighten($gray-dark, 5%);
      border-right: 4px solid #4c4c4c;
      margin-right: 5px;
      display: flex;
      align-items: center;
      overflow: hidden;
      text-overflow: ellipsis;

      &.selected {
        border-right: 4px solid #26b518;
        background: #4a4a4a;
      }
    }

    .keys {
      display: flex;

      &.selected {
        .key {
          background: #262626;
        }
      }

      .key {
        width: 8px;
        background: #161616;
        margin-right: 1px;

        &.current {
          background: #0000ff;
        }

        &.selected {
          background: #18b14a;
        }

        &.has {
          background: #fe0000;

          &.current {
            background: lighten(#0000ff, 30%);
          }
        }

        &.auto {
          background: #feba33;

          &.current {
            background: lighten(#0000ff, 50%);
          }
        }
      }
    }
  }
}
</style>
