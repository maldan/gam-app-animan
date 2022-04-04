import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { AM_Object } from '@/core/am/AM_Object';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { AM_State } from '@/core/AM_State';
import { AM_KeyVector3 } from '@/core/animation/key/AM_KeyVector3';
import Stats from 'three/examples/jsm/libs/stats.module';
import { AM_KeyQuaternion } from '@/core/animation/key/AM_KeyQuaternion';

export interface ISyncObject {
  threeObject: THREE.Object3D;
  amObject: AM_Object;
}

export class AM_Core {
  public static scene: THREE.Scene;

  private static _manipulator: TransformControls;
  private static _isManipulatorLocked = false;
  private static _manipulatorStartPosition: THREE.Vector3 = new THREE.Vector3();

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
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop((time: number) => {
      renderer.setClearColor(0x333333);
      renderer.render(scene, camera);
      controls.update();
      stats.update();
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
      this._manipulatorStartPosition = this._manipulator.position.clone();
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

      AM_State.ui.timeline.refresh();
    });

    scene.add(this._manipulator);

    // Inject html
    el.appendChild(renderer.domElement);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.zIndex = '0';

    const stats = Stats();
    stats.domElement.style.cssText = 'position:absolute; bottom:10px; right:10px;';
    el.appendChild(stats.dom);

    // Events
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'r') this._manipulator.mode = 'rotate';
      if (e.key === 'g') this._manipulator.mode = 'translate';
      if (e.key === 's') this._manipulator.mode = 'scale';
    });
  }

  public static setManipulatorTo(obj: AM_Object): void {
    this._manipulator.attach(obj.model);
  }
}
