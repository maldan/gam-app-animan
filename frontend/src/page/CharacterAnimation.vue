<template>
  <div class="main">
    <div ref="scene"></div>

    <!-- Animation list -->
    <ui-window
      v-if="isCharacterSelected()"
      title="Animation list"
      :initData="{ x: 2, y: 5, width: 15, height: 20 }"
    >
      <template v-slot:body>
        <animation-list />
      </template>
    </ui-window>

    <!-- Scene -->
    <ui-window title="Scene Hierarchy" :initData="{ x: 2, y: 30, width: 15, height: 20 }">
      <template v-slot:body>
        <scene />
      </template>
    </ui-window>

    <!-- Character list -->
    <ui-window title="Character list" :initData="{ x: 80, y: 5, width: 18, height: 20 }">
      <template v-slot:body>
        <character-list />
      </template>
    </ui-window>

    <!-- Rig list -->
    <ui-window
      v-if="isCharacterSelected()"
      title="Rig list"
      :initData="{ x: 80, y: 28, width: 18, height: 30 }"
    >
      <template v-slot:body>
        <rig-list />
      </template>
    </ui-window>

    <!-- Pose list -->
    <ui-window
      v-if="isCharacterSelected()"
      title="Pose list"
      :initData="{ x: 80, y: 61, width: 18, height: 30 }"
    >
      <template v-slot:body>
        <pose-list />
      </template>
    </ui-window>

    <!-- Blend shape -->
    <ui-window
      v-if="isCharacterSelected()"
      title="Blend Shape"
      :initData="{ x: 60, y: 75, width: 15, height: 20 }"
    >
      <template v-slot:body>
        <blend-shape />
      </template>
    </ui-window>

    <!-- Timeline -->
    <ui-window
      v-if="isCharacterSelected() && hasAnimation()"
      title="Timeline"
      :initData="{ x: 2, y: 75, width: 50, height: 20 }"
    >
      <template v-slot:body>
        <timeline ref="timeline" />
      </template>
    </ui-window>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { DataStorage } from '@/core/DataStorage';
import { Animation_Rig } from '@/core/animation/Animation_Rig';
import { Animation_Character } from '@/core/Animation_Character';
import { MainScene } from '@/core/MainScene';
import { Core } from '@/core/Core';

export default defineComponent({
  components: {},
  async mounted() {
    Core.init(this.$refs['scene'] as HTMLElement);
  },
  methods: {
    refresh() {
      this.r = Math.random();
    },
    isCharacterSelected() {
      if (this.r < 0) return;
      return MainScene.selectedObject?.userData.tag === 'Character';
    },
    hasAnimation() {
      if (this.r < 0) return;
      return (
        MainScene.selectedObject?.userData.tag === 'Character' &&
        MainScene.selectedObject?.userData.class.animation
      );
    },
    toggleAnimation() {
      //this.isPlayAnimation = !this.isPlayAnimation;
      MainScene.timelineTimer = 0;
    },
  },
  data: () => {
    return {
      movement: { x: 0, y: 0, z: 0 },
      r: 0,
      // isPlayAnimation: false,
    };
  },
});
</script>

<style lang="scss" scoped>
.main {
  // position: relative;
}
</style>
