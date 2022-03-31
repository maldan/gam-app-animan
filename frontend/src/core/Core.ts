import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { AM_Object } from '@/core/am/AM_Object';

export interface ISyncObject {
  threeObject: THREE.Object3D;
  amObject: AM_Object;
}

export class Core {
  public static scene: THREE.Scene;
  public static syncList: ISyncObject[] = [];
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
      Core.tick();
      renderer.setClearColor(0x333333);
      renderer.render(scene, camera);
      controls.update();
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

    // Inject html
    el.appendChild(renderer.domElement);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.zIndex = '0';
  }

  public static connectObject(amObject: AM_Object, threeObject: THREE.Object3D): void {
    this.scene.add(threeObject);
    this.syncList.push({
      threeObject,
      amObject,
    });
  }

  public static destroyObject(amObject: AM_Object): void {
    const x = this.syncList.find((x) => x.amObject === amObject);
    if (x) {
      Core.scene.remove(x.threeObject);
    }
  }

  public static tick(): void {
    for (let i = 0; i < Core.syncList.length; i++) {
      // Core.syncList[i].
    }
  }
}
