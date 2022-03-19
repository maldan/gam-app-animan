<template>
  <div :class="$style.boneList">
    <div v-for="bone in $store.state.scene.SelectedCharacter?.boneList" :key="bone.name">
      {{ bone.name }}
      <ui-button @click="fuckBone(bone)" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import * as THREE from 'three';

export default defineComponent({
  props: {},
  components: {},
  async mounted() {},
  methods: {
    fuckBone(bone: THREE.Bone) {
      bone.quaternion.setFromEuler(new THREE.Euler(110, 110, 0));
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
.boneList {
  display: flex;
  flex-direction: column;
}
</style>
