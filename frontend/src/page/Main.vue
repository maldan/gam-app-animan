<template>
  <div class="main">
    <div id="sus"></div>

    <!-- Animation list -->
    <ui-window
      v-if="isCharacterSelected()"
      title="Animation list"
      :initData="{ x: 5, y: 5, width: 15, height: 20 }"
    >
      <template v-slot:body>
        <animationlist />
      </template>
    </ui-window>

    <!-- Scene -->
    <ui-window title="Scene Hierarchy" :initData="{ x: 5, y: 30, width: 15, height: 20 }">
      <template v-slot:body>
        <scene />
      </template>
    </ui-window>

    <!-- Character list -->
    <ui-window title="Character list" :initData="{ x: 80, y: 5, width: 15, height: 20 }">
      <template v-slot:body>
        <characterlist />
      </template>
    </ui-window>

    <!-- Bone list -->
    <ui-window
      v-if="isCharacterSelected()"
      title="Rig list"
      :initData="{ x: 80, y: 35, width: 15, height: 40 }"
    >
      <template v-slot:body>
        <riglist />
      </template>
    </ui-window>

    <!-- Blend shape -->
    <ui-window
      v-if="isCharacterSelected()"
      title="Blend Shape"
      :initData="{ x: 60, y: 75, width: 15, height: 20 }"
    >
      <template v-slot:body>
        <blendshape />
      </template>
    </ui-window>

    <!-- Timeline -->
    <ui-window
      v-if="isCharacterSelected()"
      title="Timeline"
      :initData="{ x: 5, y: 75, width: 50, height: 20 }"
    >
      <template v-slot:header>
        <div>Timeline</div>
        <ui-button
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
        />
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
      if (DataStorage.hoverObject && DataStorage.hoverObject !== DataStorage.selectedObject) {
        DataStorage.selectedObject = DataStorage.hoverObject;
        DataStorage.manipulator.detach();
        DataStorage.manipulator.attach(DataStorage.hoverObject);
      }
    });

    // Key
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'r') DataStorage.manipulator.mode = 'rotate';
      if (e.key === 'g') DataStorage.manipulator.mode = 'translate';
    });

    let prevTime = 0;
    const animation = (time: number) => {
      // Update
      //if (this.$store.state.scene.selectedObject != null) {
      //if (this.$store.state.scene.selectedObject.userData.tag === 'Character') {
      // this.$store.state.scene.selectedObject.userData.class.tick();
      //}
      //}

      const deltaTime = (time - prevTime) / 1000;
      MainScene.timelineTimer += deltaTime;

      if (MainScene.selectedObject?.userData.tag === 'Character') {
        if (MainScene.selectedObject?.userData.class.animation && this.isPlayAnimation) {
          MainScene.selectedObject?.userData.class.animation.tick();
        }
      }
      prevTime = time;

      raycaster.setFromCamera(pointer, camera);
      const c = scene.children.filter((x) => x.name === 'BoneHelper');
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
    await this.$store.dispatch('scene/setScene', scene);

    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 5, 1, 1),
      new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, color: 0x2b2b2b }),
    );
    mesh.rotateX(THREE.MathUtils.degToRad(-90));
    scene.add(mesh);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animation);

    const ambientLight = new THREE.AmbientLight();
    scene.add(ambientLight);

    //const l = new THREE.DirectionalLight();
    //l.rotation.set(15, 0, 0);
    //scene.add(l);

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
      DataStorage.manipulatorStartPosition = DataStorage.selectedObject.position.clone();
      DataStorage.manipulatorStartRotation = DataStorage.selectedObject.quaternion.clone();
    });
    DataStorage.manipulator.addEventListener('mouseUp', () => {
      if (!DataStorage.selectedObject) return;
      if (DataStorage.selectedObject.userData.tag === 'BoneHelper') {
        const rig = DataStorage.selectedObject.userData.rig as Animation_Rig;
        const character = DataStorage.selectedObject.userData.character as Animation_Character;

        const moveDiff = DataStorage.manipulatorStartPosition
          .clone()
          .sub(DataStorage.selectedObject.position);
        rig.positionOffset.add(moveDiff.multiplyScalar(-1));

        const rotDiff = DataStorage.manipulatorStartRotation
          .clone()
          .invert()
          .multiply(DataStorage.selectedObject.quaternion);
        rig.rotationOffset.multiply(rotDiff);

        character.setCurrentKey(rig.bone.name);
        character.animation?.interpolateKey(rig.bone.name);
        character.tick();
      }
    });
    scene.add(DataStorage.manipulator);

    const stats = Stats();
    document.body.appendChild(stats.dom);

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
    toggleAnimation() {
      this.isPlayAnimation = !this.isPlayAnimation;
      MainScene.timelineTimer = 0;
    },
  },
  data: () => {
    return {
      movement: { x: 0, y: 0, z: 0 },
      r: 0,
      isPlayAnimation: false,
      timelineLayers: ['All', 'Body', 'Hand'],
    };
  },
});
</script>

<style lang="scss" scoped>
.main {
}
</style>
