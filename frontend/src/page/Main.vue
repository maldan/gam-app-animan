<template>
  <div class="main">
    <div id="sus"></div>
    <ui-window title="Animation list"></ui-window>
    <ui-window title="Event list"></ui-window>
    <ui-window title="Character list"></ui-window>
    <ui-window title="Pose list"></ui-window>
    <ui-window title="Blend Shape"></ui-window>

    <ui-window title="Timeline">
      <template v-slot:body>
        <timeline />
      </template>
    </ui-window>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import * as THREE from 'three';

export default defineComponent({
  components: {},
  async mounted() {
    // init

    const camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      10,
    );
    camera.position.z = 1;

    const scene = new THREE.Scene();

    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const material = new THREE.MeshNormalMaterial();

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animation);

    // @ts-ignore
    document.getElementById('sus').appendChild(renderer.domElement);

    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.zIndex = '0';

    // animation

    function animation(time: number) {
      mesh.rotation.x = time / 2000;
      mesh.rotation.y = time / 1000;

      renderer.setClearColor(0x333333);
      renderer.render(scene, camera);
    }
  },
  methods: {},
  data: () => {
    return {};
  },
});
</script>

<style lang="scss" scoped>
.main {
}
</style>
