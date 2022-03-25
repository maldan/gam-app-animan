<template>
  <div :class="$style.scene">
    <div
      class="clickable"
      :class="[$style.object, isSelected(x.uuid) ? $style.selected : null]"
      v-for="x in objectList"
      :key="x.uuid + '_' + r"
      @click="selectObject(x.uuid)"
    >
      {{ x.type }} {{ x.name }}
      <ui-icon @click.stop="removeObject(x.uuid)" :class="$style.remove" name="trash" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { MainScene } from '@/core/MainScene';

export default defineComponent({
  props: {},
  components: {},
  computed: {
    objectList() {
      if (this.r === 0) return [];
      if (!MainScene.scene) return [];
      return MainScene.scene.children
        .filter((x) => x.name !== 'BoneHelper')
        .map((x) => {
          return {
            uuid: x.uuid,
            name: x.name,
            type: x.type,
          };
        });
    },
  },
  async mounted() {
    MainScene.ui.scene.ref = this;
  },
  methods: {
    refresh() {
      this.r = Math.random();
    },
    isSelected(uuid: string): boolean {
      return MainScene.selectedObject?.uuid === uuid;
    },
    removeObject(uuid: string) {
      MainScene.removeObject(MainScene.scene.children.find((x) => x.uuid === uuid));
      this.refresh();
    },
    selectObject(uuid: string) {
      MainScene.selectObject(MainScene.scene.children.find((x) => x.uuid === uuid));
      this.refresh();
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
.scene {
  display: flex;
  flex-direction: column;
  font-size: 14px;
  user-select: none;

  .object {
    background: #1b1b1b;
    color: #999999;
    padding: 5px;
    margin-bottom: 1px;
    display: flex;
    align-items: center;

    .remove {
      margin-left: auto;
    }

    &.selected {
      background: #33a833;
      color: #ffffff;
    }
  }
}
</style>
