<template>
  <div :class="$style.rigList">
    <div
      :class="$style.rig"
      v-for="rig in $store.state.scene.SelectedCharacter?.rigList"
      :key="rig.name"
    >
      <div>{{ rig.bone.name }}</div>
      <div>{{ s(rig) }}</div>
      <div style="margin-left: auto"></div>
      <ui-button :class="$style.button" @click="fuckRig(rig)" />
      <ui-button :class="$style.button" @click="resetRig(rig)" text="R" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import * as THREE from 'three';
import { Animation_Rig } from '@/core/Animation_Rig';

export default defineComponent({
  props: {},
  components: {},
  async mounted() {},
  methods: {
    fuckRig(rig: Animation_Rig) {
      rig.rotationOffset.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 45, 0)));
    },
    resetRig(rig: Animation_Rig) {
      rig.rotationOffset.identity();
    },
    s(rig: Animation_Rig) {
      const tt = new THREE.Euler().setFromQuaternion(rig.rotationOffset);
      return `${THREE.MathUtils.radToDeg(tt.x)} ${THREE.MathUtils.radToDeg(
        tt.y,
      )} ${THREE.MathUtils.radToDeg(tt.z)}`;
    },
  },
  data: () => {
    return {
      THREE: THREE,
    };
  },
});
</script>

<style lang="scss" module>
.rigList {
  display: flex;
  flex-direction: column;
  font-size: 14px;
  user-select: none;

  .rig {
    display: flex;
    align-items: center;
    margin-bottom: 5px;

    .button {
      flex: none;
      width: 32px;
      height: 32px;
    }
  }
}
</style>
