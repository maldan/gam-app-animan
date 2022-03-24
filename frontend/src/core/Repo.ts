import * as THREE from 'three';
import { IVirtualObject } from '@/Types';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { MathUtils } from 'three';

export class Repo {
  public static async getPreview(virtualObject: IVirtualObject): Promise<string> {
    // init
    const camera = new THREE.PerspectiveCamera(45, 256 / 256, 0.001, 1024);
    camera.position.y = 2;
    camera.position.z = 3;
    //  camera.rotateX(MathUtils.degToRad(25));
    const scene = new THREE.Scene();

    const ambientLight = new THREE.AmbientLight();
    scene.add(ambientLight);

    const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
    renderer.setSize(256, 256);

    // Grid
    const grid = 5;
    scene.add(new THREE.GridHelper(grid, grid * 2));

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
      const fbxLoader = new FBXLoader();
      fbxLoader.load(
        virtualObject.modelPath,
        (object) => {
          /*object.traverse(function (child) {
            if ((child as THREE.Mesh).isMesh) {
              if ((child as THREE.Mesh).material) {
                ((child as THREE.Mesh).material as THREE.MeshPhongMaterial).shininess = 2;
                ((child as THREE.Mesh).material as THREE.MeshPhongMaterial).reflectivity = 0.1;
              }
            }
          });*/

          // object.rotateY(MathUtils.degToRad(-45));
          scene.add(object);

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
