<template>
  <div :class="$style.main">
    <div id="sus"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import * as THREE from 'three';
import { MainScene } from '@/core/MainScene';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';

export default defineComponent({
  components: {},
  async mounted() {
    const animation = (time: number) => {
      renderer.setClearColor(0x333333);
      renderer.render(scene, camera);
      controls.update();
      stats.update();
    };

    // init
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.001,
      2048,
    );
    camera.position.z = 5;

    const scene = new THREE.Scene();
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 5, 1, 1),
      new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, color: 0x2b2b2b }),
    );
    mesh.rotateX(THREE.MathUtils.degToRad(-90));
    scene.add(mesh);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animation);

    //const ambientLight = new THREE.AmbientLight();
    //scene.add(ambientLight);

    const l = new THREE.DirectionalLight(0xffffff, 1);
    l.position.set(0, 0, 10);
    scene.add(l);
    const l2 = new THREE.DirectionalLight(0xffffff, 1);
    l2.position.set(0, 0, -10);
    scene.add(l2);

    // @ts-ignore
    document.getElementById('sus').appendChild(renderer.domElement);

    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.zIndex = '0';

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.mouseButtons = {
      // @ts-ignore
      LEFT: null,
      MIDDLE: THREE.MOUSE.ROTATE,
      // @ts-ignore
      RIGHT: null,
    };
    controls.autoRotate = false;

    const stats = Stats();
    document.body.appendChild(stats.dom);

    MainScene.scene = scene;
    MainScene.ui.main.ref = this;

    MainScene.loadCharacter(
      `${this.$store.state.main.ROOT_URL}/data/object/${this.$route.params.path}/model.fbx`,
    );
  },
  methods: {},
  data: () => {
    return {};
  },
});
</script>

<style lang="scss" module>
.main {
}
</style>
