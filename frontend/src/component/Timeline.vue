<template>
  <div :class="$style.timeline">
    <div :class="$style.line" v-for="rig in rigList" :key="rig.bone.name">
      <div
        @click="selectKey(rig.bone.name)"
        :class="[$style.title, selectedKeys.includes(rig.bone.name) ? $style.selected : null]"
      >
        {{ rig.bone.name }}
      </div>
      <div :class="[$style.keys, selectedKeys.includes(rig.bone.name) ? $style.selected : null]">
        <div
          :class="[
            $style.key,
            animation?.frameId === frameId - 1 ? $style.selected : '',
            animation.frames[frameId - 1].keys[rig.bone.name] ? $style.has : '',
            animation.frames[frameId - 1].keys[rig.bone.name]?.isAuto ? $style.auto : '',
          ]"
          v-for="frameId in animation?.frameCount"
          :key="frameId"
          @click="
            goToFrame(frameId - 1);
            selectKey(rig.bone.name);
          "
        ></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Animation_Character } from '@/core/Animation_Character';
import { MainScene } from '@/core/MainScene';

export default defineComponent({
  props: {},
  components: {},
  computed: {
    rigList() {
      if (this.r < 0) return [];
      if (!MainScene.selectedObject) return [];
      const ch = MainScene.selectedObject.userData.class as Animation_Character;
      if (this.filterKeys.length === 0) return ch.rigList;
      return ch.rigList.filter((x) => this.filterKeys.includes(x.bone.name));
    },
    animation() {
      if (this.r < 0) return null;
      return MainScene.selectedObject?.userData?.class?.animation;
    },
  },
  async mounted() {
    this.kd = (e: KeyboardEvent) => {
      if (!MainScene.selectedObject) return;
      if (MainScene.selectedObject?.userData.tag !== 'Character') return;

      if (e.key === 'ArrowRight') {
        this.animation.frameId += 1;
        this.refresh();
      }
      if (e.key === 'ArrowLeft') {
        this.animation.frameId -= 1;
        this.refresh();
      }
    };
    document.addEventListener('keydown', this.kd);

    MainScene.ui.timeline.ref = this;
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.kd);
  },
  methods: {
    refresh() {
      this.r = Math.random();
    },
    goToFrame(id: number) {
      this.animation.frameId = id;
      this.refresh();
    },
    selectKey(key: string) {
      this.selectedKeys.length = 0;
      this.selectedKeys.push(key);
    },
    setLayers(layer: string) {
      this.filterKeys.length = 0;
      if (layer === 'Body') this.filterKeys.push('Root', 'Belly', 'Chest', 'Neck', 'Head');
      if (layer === 'Hand')
        this.filterKeys.push('ArmL', 'ForearmL', 'HandL', 'ArmR', 'ForearmR', 'HandR');
    },
  },
  data: () => {
    return {
      kd: undefined as any,
      r: 0,
      filterKeys: [] as string[],
      selectedKeys: [] as string[],
    };
  },
});
</script>

<style lang="scss" module>
@import '../gam_sdk_ui/vue/style/color';
@import '../gam_sdk_ui/vue/style/size';

.timeline {
  .line {
    display: flex;
    margin-bottom: 1px;

    .title {
      min-width: 128px;
      font-size: 14px;
      color: $text-gray;
      background: lighten($gray-dark, 5%);
      border-right: 4px solid #4c4c4c;
      margin-right: 5px;

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

        &.selected {
          background: #0000ff;
        }

        &.has {
          background: #fe0000;
        }

        &.auto {
          background: #feba33;
        }
      }
    }
  }
}
</style>
