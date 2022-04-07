import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { AM_Object } from '@/core/am/AM_Object';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { AM_State } from '@/core/AM_State';
import { AM_KeyVector3 } from '@/core/animation/key/AM_KeyVector3';
import Stats from 'three/examples/jsm/libs/stats.module';
import { AM_KeyQuaternion } from '@/core/animation/key/AM_KeyQuaternion';
import { AM_Character } from '@/core/am/AM_Character';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { MathUtils } from 'three';

export class AM_Preview {
  public static async getPreview(virtualObject: { modelPath: string }): Promise<string> {
    // init
    const camera = new THREE.PerspectiveCamera(45, 256 / 256, 0.001, 1024);
    camera.position.y = 0;
    camera.position.z = 3;
    //  camera.rotateX(MathUtils.degToRad(25));
    const scene = new THREE.Scene();

    // Light
    //const ambientLight = new THREE.AmbientLight();
    //scene.add(ambientLight);
    const l = new THREE.DirectionalLight(0xffffff, 1);
    l.position.set(0, 5, 10);
    scene.add(l);

    const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
    renderer.setSize(512, 512);
    renderer.outputEncoding = THREE.sRGBEncoding;

    // Grid
    //const grid = 5;
    //scene.add(new THREE.GridHelper(grid, grid * 2));

    // @ts-ignore
    document.body.appendChild(renderer.domElement);

    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.zIndex = '-1';

    const controls = new OrbitControls(camera, renderer.domElement);
    // controls.center = new THREE.Vector3(0, -1, 0);
    controls.autoRotate = true;

    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      loader.load(
        virtualObject.modelPath,
        (gltf) => {
          // Get object and add to scene
          const object = gltf.scene.children[0] as THREE.Object3D;
          object.traverse(function (child) {
            if ((child as THREE.Mesh).isMesh) {
              if ((child as THREE.Mesh).material) {
                ((child as THREE.Mesh).material as THREE.MeshPhongMaterial).shininess = 2;
                ((child as THREE.Mesh).material as THREE.MeshPhongMaterial).reflectivity = 0.1;
              }
            }
          });
          object.setRotationFromEuler(new THREE.Euler(0, MathUtils.degToRad(-45), 0));
          scene.add(object);

          // Calculate size
          const size = new THREE.Box3().setFromObject(object);
          object.position.set(0, -size.max.y / 2, 0);
          camera.position.z = size.max.y * 1.2;

          // Render
          setTimeout(() => {
            controls.update();
            renderer.setClearColor(0x333333);
            renderer.render(scene, camera);

            document.body.removeChild(renderer.domElement);

            resolve(renderer.domElement.toDataURL('image/jpeg'));
          }, 16);
        },
        (xhr) => {},
        (error) => {
          reject(error);
        },
      );
    });
  }
}
