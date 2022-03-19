<template>
  <div class="main">
    <div id="sus"></div>
    <ui-window title="Animation list" :initData="{ x: 400, y: 300, width: 320 }">
      <template v-slot:body>
        <animationlist />
      </template>
    </ui-window>
    <ui-window title="Event list"></ui-window>

    <ui-window title="Character list" :initData="{ x: 400, y: 100, width: 320 }">
      <template v-slot:body>
        <characterlist />
      </template>
    </ui-window>

    <!-- Bone list -->
    <ui-window title="Bone list" :initData="{ x: 400, y: 800, width: 320 }">
      <template v-slot:body>
        <bonelist />
      </template>
    </ui-window>

    <ui-window title="Pose list"></ui-window>

    <!-- Blend shape -->
    <ui-window title="Blend Shape" :initData="{ x: 200, y: 400, width: 320 }">
      <template v-slot:body>
        <blendshape />
      </template>
    </ui-window>

    <!-- Timeline -->
    <ui-window title="Timeline" :initData="{ x: 100, y: 500, width: 720 }">
      <template v-slot:body>
        <timeline />
      </template>
    </ui-window>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Animation_Character } from '@/core/Animation_Character';

export default defineComponent({
  components: {},
  async mounted() {
    const animation = (time: number) => {
      renderer.setClearColor(0x333333);
      renderer.render(scene, camera);
      controls.update();
    };

    // init
    const camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      10,
    );
    camera.position.z = 5;

    const scene = new THREE.Scene();

    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const material = new THREE.MeshNormalMaterial();

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animation);

    const ambientLight = new THREE.AmbientLight();
    scene.add(ambientLight);

    // @ts-ignore
    document.getElementById('sus').appendChild(renderer.domElement);

    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.zIndex = '0';

    const fbxLoader = new FBXLoader();
    fbxLoader.load(
      'Coco.fbx',
      (object) => {
        const ch = new Animation_Character();
        ch.init('Coco', object);

        this.$store.dispatch('scene/selectCharacter', ch);

        scene.add(object);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
      },
      (error) => {
        console.log(error);
      },
    );

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.mouseButtons = {
      // @ts-ignore
      LEFT: null,
      MIDDLE: THREE.MOUSE.ROTATE,
      // @ts-ignore
      RIGHT: null,
    };
    controls.autoRotate = false;
  },
  methods: {},
  data: () => {
    return {
      movement: { x: 0, y: 0, z: 0 },
    };
  },
});
</script>

<style lang="scss" scoped>
.main {
}
</style>
