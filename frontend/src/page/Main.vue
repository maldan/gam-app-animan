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
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { SceneNavigation } from '@/core/control/SceneNavigation';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default defineComponent({
  components: {},
  async mounted() {
    const animation = (time: number) => {
      // mesh.rotation.x = time / 2000;
      // mesh.rotation.y = time / 1000;

      renderer.setClearColor(0x333333);
      renderer.render(scene, camera);

      controls.update();
      // SceneNavigation.tick();

      if (this.bone.quaternion) {
        // console.log();
        this.bone.quaternion.setFromEuler(new THREE.Euler(camera.position.y, 0, 0));
      }
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
        //console.log(object);
        //this.bone = object.children[2].children[0].children[1] as THREE.Bone;

        //(object.children[5] as THREE.SkinnedMesh).updateMorphTargets();
        // @ts-ignore
        //(object.children[5] as THREE.SkinnedMesh).material.morphTargets = true;
        // @ts-ignore
        (object.children[5] as THREE.SkinnedMesh).morphTargetInfluences[1] = 1;
        //

        // object.traverse(function (child) {
        //     if ((child as THREE.Mesh).isMesh) {
        //         // (child as THREE.Mesh).material = material
        //         if ((child as THREE.Mesh).material) {
        //             ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).transparent = false
        //         }
        //     }
        // })
        //object.scale.set(0.1, 0.1, 0.1);
        scene.add(object);

        //const helper = new THREE.SkeletonHelper(object);
        //scene.add(helper);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
      },
      (error) => {
        console.log(error);
      },
    );
    // animation
    //  SceneNavigation.init(camera);

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
      bone: {} as THREE.Bone,
    };
  },
});
</script>

<style lang="scss" scoped>
.main {
}
</style>
