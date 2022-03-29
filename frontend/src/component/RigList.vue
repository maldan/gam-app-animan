<template>
  <div :class="$style.rigList">
    <ui-input style="margin-bottom: 10px" placeholder="Filter..." v-model="filter" />

    <div :class="$style.rig" v-for="rig in rigList" :key="rig.name">
      <div :class="$style.row">
        <div :class="$style.name">{{ rig.bone.name }}</div>

        <ui-button :class="$style.button" @click="resetRig(rig)" text="R" />
      </div>

      <div :class="$style.row">
        <div :class="$style.rotation" v-html="rot(rig)"></div>
        <div :class="$style.position" v-html="p(rig)"></div>
        <div :class="$style.scale" v-html="s(rig)"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import * as THREE from 'three';
import { Animation_Rig } from '@/core/Animation_Rig';
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
      return (ch.rigList || []).filter((x) =>
        x.bone.name.toLowerCase().match(this.filter.toLowerCase()),
      );
    },
    character(): Animation_Character {
      // @ts-ignore
      if (this.r < 0) return null;
      return MainScene.selectedObject?.userData.class as Animation_Character;
    },
  },
  async mounted() {
    MainScene.ui.rig.ref = this;
  },
  methods: {
    refresh() {
      this.r = Math.random();
    },

    resetRig(rig: Animation_Rig) {
      rig.rotationOffset.identity();
      rig.positionOffset.set(0, 0, 0);
      rig.scaleOffset.set(0, 0, 0);
      this.character.setCurrentKey(rig.bone.name);
      this.character.tick();
      this.refresh();
    },
    rot(rig: Animation_Rig) {
      const tt = new THREE.Euler().setFromQuaternion(rig.rotationOffset);
      return `
        <div>${~~THREE.MathUtils.radToDeg(tt.x)}</div>
        <div>${~~THREE.MathUtils.radToDeg(tt.y)}</div>
        <div>${~~THREE.MathUtils.radToDeg(tt.z)}</div>
      `;
    },
    p(rig: Animation_Rig) {
      return `
         <div>${rig.positionOffset.x.toFixed(2)}</div>
         <div>${rig.positionOffset.y.toFixed(2)}</div>
         <div>${rig.positionOffset.z.toFixed(2)}</div>
      `;
    },
    s(rig: Animation_Rig) {
      return `
         <div>${rig.scaleOffset.x.toFixed(2)}</div>
         <div>${rig.scaleOffset.y.toFixed(2)}</div>
         <div>${rig.scaleOffset.z.toFixed(2)}</div>
      `;
    },
  },
  data: () => {
    return {
      THREE: THREE,
      r: 0,
      filter: '',
    };
  },
});
</script>

<style lang="scss" module>
@import '../gam_sdk_ui/vue/style/color';
@import '../gam_sdk_ui/vue/style/size';

.rigList {
  display: flex;
  flex-direction: column;
  font-size: 14px;
  user-select: none;
  color: $text-gray;

  .rig {
    display: flex;
    flex-direction: column;
    // align-items: center;
    margin-bottom: 5px;

    .row {
      display: flex;
      margin-bottom: 5px;
      align-items: center;
    }

    .name {
      flex: 1;
      font-weight: bold;
    }

    .rotation,
    .position,
    .scale {
      flex: 1;
      background: #1b1b1b;
      padding: 3px;
      margin-right: 5px;
      display: flex;
      font-size: 12px;

      > div {
        flex: 1;
        text-align: center;
      }
    }

    .rotation {
      flex: none;
      width: 60px;
    }

    .scale {
      margin-right: 0;
    }

    .button {
      flex: none;
      width: 24px;
      height: 24px;
      font-size: 14px;
      align-items: center;
      justify-content: center;
      margin-left: 5px;
    }
  }
}
</style>
