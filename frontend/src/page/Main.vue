<template>
  <div class="main">
    <div id="sus"></div>

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
      <template v-slot:header>
        <div>Timeline</div>
        <!-- <ui-button
          @click="toggleAnimation()"
          :text="isPlayAnimation ? 'Stop' : 'Play'"
          style="flex: none; padding: 5px; margin-left: 5px"
        />
        <ui-button
          v-for="l in timelineLayers"
          :key="l"
          @click="$refs['timeline'].setLayers(l)"
          :text="l"
          style="flex: none; padding: 5px; margin-left: 5px"
        /> -->
      </template>
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
import { Animation_Rig } from '@/core/Animation_Rig';
import { Animation_Character } from '@/core/Animation_Character';
import { MainScene } from '@/core/MainScene';

export default defineComponent({
  components: {},
  async mounted() {
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    window.addEventListener('pointermove', (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('mousedown', (e: MouseEvent) => {
      if (DataStorage.isLockManipulator) return;

      if (e.button === 0) {
        DataStorage.selectedObject = undefined;
        DataStorage.setManipulatorTo(undefined);

        if (DataStorage.hoverObject) {
          DataStorage.selectedObject = DataStorage.hoverObject;
          DataStorage.setManipulatorTo(DataStorage.hoverObject);
        }
      }
    });

    // Key
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'r') DataStorage.manipulator.mode = 'rotate';
      if (e.key === 'g') DataStorage.manipulator.mode = 'translate';
      if (e.key === 's') DataStorage.manipulator.mode = 'scale';
    });

    let prevTime = 0;
    const animation = (time: number) => {
      const deltaTime = (time - prevTime) / 1000;
      MainScene.timelineTimer += deltaTime;

      if (MainScene.selectedObject?.userData.tag === 'Character') {
        if (MainScene.selectedObject?.userData.class.animation && MainScene.isPlayAnimation) {
          MainScene.selectedObject?.userData.class.animation.tick();
        }
      }
      prevTime = time;

      raycaster.setFromCamera(pointer, camera);
      const c = scene.children.filter((x) => x.name === 'BoneHelper' && x.visible);
      c.forEach((x) => {
        // @ts-ignore
        x.material.color.set(0xffffff);
      });
      DataStorage.hoverObject = undefined;

      const intersects = raycaster.intersectObjects(c, true);
      if (intersects.length > 0) {
        const object = intersects[0].object as THREE.Mesh;

        // @ts-ignore
        object.material.color.set(0x00ff00);
        DataStorage.hoverObject = object;
      }

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
      64,
    );
    camera.position.z = 5;

    const scene = new THREE.Scene();

    // Grid
    const grid = 5;
    scene.add(new THREE.GridHelper(grid, grid * 2, 0x999999, 0x666666));

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

    DataStorage.manipulator = new TransformControls(camera, renderer.domElement);
    DataStorage.manipulator.size = 0.5;
    DataStorage.manipulator.setSpace('local');

    DataStorage.manipulator.addEventListener('mouseDown', () => {
      if (!DataStorage.selectedObject) return;
      DataStorage.isLockManipulator = true;
      DataStorage.manipulatorStartPosition = DataStorage.selectedObject.position.clone();
      DataStorage.manipulatorStartRotation = DataStorage.selectedObject.quaternion.clone();
      DataStorage.manipulatorStartScale = DataStorage.selectedObject.scale.clone();
    });
    DataStorage.manipulator.addEventListener('mouseUp', () => {
      if (!DataStorage.selectedObject) return;
      DataStorage.isLockManipulator = false;

      if (DataStorage.selectedObject.userData.tag === 'BoneHelper') {
        const rig = DataStorage.selectedObject.userData.rig as Animation_Rig;
        const character = DataStorage.selectedObject.userData.character as Animation_Character;

        /*const gr = new THREE.Quaternion();
        DataStorage.selectedObject.getWorldQuaternion(gr);

        const from = DataStorage.manipulatorStartPosition.clone();
        const to = DataStorage.selectedObject.position.clone();

        const dir = new THREE.Vector3();
        dir.subVectors(from, to).normalize();

        dir.applyQuaternion(gr);

        const distance = DataStorage.manipulatorStartPosition
          .clone()
          .distanceTo(DataStorage.selectedObject.position);

        rig.positionOffset.add(dir.multiplyScalar(distance));*/

        if (DataStorage.manipulator.mode === 'translate') {
          const diff = DataStorage.selectedObject.worldToLocal(
            DataStorage.manipulatorStartPosition,
          );
          rig.positionOffset.add(diff.multiplyScalar(-1));
        }

        if (DataStorage.manipulator.mode === 'scale') {
          const diff = DataStorage.selectedObject.scale
            .clone()
            .sub(DataStorage.manipulatorStartScale);
          rig.scaleOffset.add(diff);
        }

        /*const moveDiff = DataStorage.manipulatorStartPosition
          .clone()
          .sub(DataStorage.selectedObject.position);

        const dir = new THREE.Vector3();
        dir
          .subVectors(DataStorage.manipulatorStartPosition, DataStorage.selectedObject.position)
          .normalize();
        const distance = DataStorage.manipulatorStartPosition
          .clone()
          .distanceTo(DataStorage.selectedObject.position);

        rig.positionOffset.add(dir.multiplyScalar(distance * -1));*/

        if (DataStorage.manipulator.mode === 'rotate') {
          const rotDiff = DataStorage.manipulatorStartRotation
            .clone()
            .invert()
            .multiply(DataStorage.selectedObject.quaternion);
          rig.rotationOffset.multiply(rotDiff);
        }

        character.setCurrentKey(rig.bone.name);
        character.animation?.interpolateKey(rig.bone.name);
        character.tick();
        MainScene.ui.timeline.refresh();
        MainScene.ui.rig.refresh();
      }
    });
    scene.add(DataStorage.manipulator);

    const stats = Stats();
    // document.body.appendChild(stats.dom);

    renderer.outputEncoding = THREE.sRGBEncoding;

    MainScene.scene = scene;
    MainScene.ui.main.ref = this;
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
