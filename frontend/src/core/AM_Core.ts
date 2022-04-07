import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { AM_Object } from '@/core/am/AM_Object';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { AM_State } from '@/core/AM_State';
import { AM_KeyVector3 } from '@/core/animation/key/AM_KeyVector3';
import Stats from 'three/examples/jsm/libs/stats.module';
import { AM_KeyQuaternion } from '@/core/animation/key/AM_KeyQuaternion';
import { AM_Character } from '@/core/am/AM_Character';

export class AM_Core {
  public static scene: THREE.Scene;

  private static _manipulator: TransformControls;
  private static _isManipulatorLocked = false;
  private static _manipulatorStartPosition: THREE.Vector3 = new THREE.Vector3();
  private static _manipulatorStartRotation: THREE.Quaternion = new THREE.Quaternion();

  public static init(el: HTMLElement): void {
    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.001,
      64,
    );
    camera.position.z = 5;

    // Scene
    const scene = new THREE.Scene();
    this.scene = scene;

    // Render
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    let prevTime = 0;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop((time: number) => {
      const deltaTime = (time - prevTime) / 1000;
      prevTime = time;

      renderer.setClearColor(0x333333);
      renderer.render(scene, camera);
      controls.update();
      stats.update();

      // Play animation
      if (AM_State.isAnimationPlay) {
        AM_State.animationTime += deltaTime;

        if (AM_State.mode === 'clip') {
          for (let i = 0; i < AM_State.objectList.length; i++) {
            const obj = AM_State.objectList[i];
            if (obj.animationController.frameCount > 0) {
              const isChanged =
                obj.animationController.frameId !==
                ~~(AM_State.animationTime * 24) % obj.animationController.frameCount;
              obj.animationController.frameId =
                ~~(AM_State.animationTime * 24) % obj.animationController.frameCount;
              if (isChanged) obj.applyAnimation(obj.animationController.animation);
            }
          }
        } else {
          if (AM_State.animationController.frameCount > 0) {
            AM_State.animationController.frameId =
              ~~(AM_State.animationTime * 24) % AM_State.animationController.frameCount;
          }
        }
      }

      // Ray cast with bones
      AM_State.hoverBone = undefined;
      raycaster.setFromCamera(pointer, camera);
      if (AM_State.selectedObject instanceof AM_Character) {
        const bones = Object.values(AM_State.selectedObject.boneList);

        // Fill bones with white color
        bones.forEach((x) => {
          // @ts-ignore
          x.boneHelper.material.color.set(0xffffff);
        });
        if (AM_State.selectedBone) {
          // @ts-ignore
          AM_State.selectedBone.boneHelper.material.color.set(0xff0000);
        }

        // Check intersects with bones
        const intersects = raycaster.intersectObjects(
          bones.map((x) => x.boneHelper),
          true,
        );
        if (intersects.length > 0) {
          const object = intersects[0].object as THREE.Mesh;
          if (object !== AM_State.selectedBone?.boneHelper) {
            // @ts-ignore
            object.material.color.set(0x00ff00);
          }

          // Set hover bone
          AM_State.hoverBone = bones.find((x) => x.boneHelper === object);
        }
      }
    });
    renderer.outputEncoding = THREE.sRGBEncoding;

    // Scene control
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.mouseButtons = {
      // @ts-ignore
      LEFT: null,
      MIDDLE: THREE.MOUSE.ROTATE,
      // @ts-ignore
      RIGHT: null,
    };
    controls.autoRotate = false;

    // Grid
    const grid = 5;
    scene.add(new THREE.GridHelper(grid, grid * 2, 0x666666, 0x222222));

    // Light
    const l = new THREE.DirectionalLight(0xffffff, 1);
    l.position.set(0, 5, 10);
    scene.add(l);
    const l2 = new THREE.DirectionalLight(0xffffff, 1);
    l2.position.set(0, -5, -10);
    scene.add(l2);

    // Manipulator
    this._manipulator = new TransformControls(camera, renderer.domElement);
    this._manipulator.size = 0.5;
    this._manipulator.setSpace('local');
    this._manipulator.addEventListener('mouseDown', () => {
      if (!this._manipulator) return;
      this._isManipulatorLocked = true;
      if (AM_State.selectedBone) {
        this._manipulatorStartPosition = AM_State.selectedBone.boneHelper.position.clone();
        this._manipulatorStartRotation = AM_State.selectedBone.boneHelper.quaternion.clone();
      } else {
        this._manipulatorStartPosition = this._manipulator.position.clone();
        this._manipulatorStartRotation = this._manipulator.quaternion.clone();
      }
    });
    this._manipulator.addEventListener('mouseUp', () => {
      if (!this._manipulator) return;
      this._isManipulatorLocked = false;

      // Translate
      if (this._manipulator.mode === 'translate') {
        const pos = AM_State.selectedObject?.model.position;
        if (AM_State.selectedAnimation && pos) {
          AM_State.selectedAnimation.setCurrentKey(
            new AM_KeyVector3('transform.position', { x: pos.x, y: pos.y, z: pos.z }),
          );
        }
      }

      // Rotate
      if (this._manipulator.mode === 'rotate') {
        const rot = AM_State.selectedObject?.model.quaternion;
        if (AM_State.selectedAnimation && rot) {
          AM_State.selectedAnimation.setCurrentKey(
            new AM_KeyQuaternion('transform.rotation', { x: rot.x, y: rot.y, z: rot.z, w: rot.w }),
          );
        }
      }

      // Bone mode
      if (AM_State.selectedBone) {
        const rotDiff = this._manipulatorStartRotation
          .clone()
          .invert()
          .multiply(AM_State.selectedBone.boneHelper.quaternion);

        AM_State.selectedBone.rotationOffset.multiply(rotDiff);
      }

      AM_State.selectedObject?.update();
      AM_State.ui.timeline.refresh();
    });
    scene.add(this._manipulator);

    // Ray cast
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    // Inject html
    el.appendChild(renderer.domElement);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.zIndex = '0';

    // Stats
    const stats = Stats();
    stats.domElement.style.cssText = 'position:absolute; bottom:10px; right:10px;';
    el.appendChild(stats.dom);

    // Events
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'r') this._manipulator.mode = 'rotate';
      if (e.key === 'g') this._manipulator.mode = 'translate';
      if (e.key === 's') this._manipulator.mode = 'scale';
    });
    window.addEventListener('pointermove', (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });
    window.addEventListener('mousedown', (e: MouseEvent) => {
      if (this._isManipulatorLocked) return;
      if (e.button === 0) {
        /*DataStorage.selectedObject = undefined;
        DataStorage.setManipulatorTo(undefined);
        if (DataStorage.hoverObject) {
          DataStorage.selectedObject = DataStorage.hoverObject;
          DataStorage.setManipulatorTo(DataStorage.hoverObject);
        }*/
        AM_State.selectedBone = undefined;
        this._manipulator.detach();

        if (AM_State.hoverBone) {
          AM_State.selectedBone = AM_State.hoverBone;
          this._manipulator.attach(AM_State.selectedBone.boneHelper);
        }
      }
    });
  }

  public static setManipulatorTo(obj: AM_Object | undefined): void {
    if (!obj) this._manipulator.detach();
    else this._manipulator.attach(obj.model);
  }
}
