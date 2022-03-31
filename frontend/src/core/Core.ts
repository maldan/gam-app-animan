import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class Core {
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

    // Render
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop((time: number) => {
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

    // Inject html
    el.appendChild(renderer.domElement);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.zIndex = '0';
  }
}
