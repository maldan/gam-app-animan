import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { AM_Object } from '@/core/am/AM_Object';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { AM_State } from '@/core/AM_State';
import { AM_KeyVector3 } from '@/core/animation/key/AM_KeyVector3';
import Stats from 'three/examples/jsm/libs/stats.module';
import { AM_KeyQuaternion } from '@/core/animation/key/AM_KeyQuaternion';
import { AM_Character } from '@/core/am/AM_Character';
import { AM_Bone } from '@/core/am/AM_Bone';
import { MathUtils } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader';

export class AM_Core {
  public static scene: THREE.Scene;

  private static _manipulator: TransformControls;
  private static _isManipulatorLocked = false;
  private static _isManipulatorCanUnlock = false;
  private static _manipulatorStartPosition: THREE.Vector3 = new THREE.Vector3();
  private static _manipulatorStartRotation: THREE.Quaternion = new THREE.Quaternion();
  private static _manipulatorStartScale: THREE.Vector3 = new THREE.Vector3();
  private static _objectStartRotation: THREE.Quaternion = new THREE.Quaternion();
  private static _objectStartPosition: THREE.Vector3 = new THREE.Vector3();
  private static _objectStartScale: THREE.Vector3 = new THREE.Vector3();

  private static _renderer: THREE.WebGLRenderer;
  private static _scene: THREE.Scene;
  private static _camera: THREE.PerspectiveCamera;
  private static _composer: EffectComposer;
  private static _outlinePass: OutlinePass;

  public static init(el: HTMLElement): void {
    // Camera
    this._camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.001,
      64,
    );
    this._camera.position.z = 5;

    // Scene
    this._scene = new THREE.Scene();
    this.scene = this._scene;

    // Render
    let prevTime = 0;
    this._renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this._renderer.shadowMap.enabled = true;
    this._renderer.setSize(window.innerWidth, window.innerHeight);
    this._renderer.setAnimationLoop((time: number) => {
      const deltaTime = (time - prevTime) / 1000;
      prevTime = time;

      //this._renderer.setClearColor(0x333333);
      //this._renderer.render(scene, camera);
      /*const before = AM_State.selectedObject;
      AM_Core.setManipulatorTo(undefined);

      AM_Core.setManipulatorTo(before);*/

      controls.update();
      stats.update();
      this._composer.render();

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
              if (isChanged) {
                obj.applyAnimation(obj.animationController.animation);
                AM_State.ui.timeline.refresh();
                AM_State.ui.shape.refresh();
              }
            }
          }
        } else {
          if (AM_State.animationController.frameCount > 0) {
            AM_State.animationController.frameId =
              ~~(AM_State.animationTime * 24) % AM_State.animationController.frameCount;
          }
        }
      }

      const width = window.innerWidth;
      const height = window.innerHeight;

      this._camera.aspect = width / height;
      this._camera.updateProjectionMatrix();

      this._renderer.setSize(width, height);

      // Outline
      if (AM_State.selectedObject instanceof AM_Bone)
        this._outlinePass.selectedObjects = [AM_State.selectedObject.parent.model];
      else if (AM_State.selectedObject instanceof AM_Object)
        this._outlinePass.selectedObjects = [AM_State.selectedObject.model];
      else this._outlinePass.selectedObjects.length = 0;
    });
    // this._renderer.outputEncoding = THREE.sRGBEncoding;

    // Scene control
    const controls = new OrbitControls(this._camera, this._renderer.domElement);
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
    this._scene.add(new THREE.GridHelper(grid, grid * 2, 0x666666, 0x222222));

    // Floor
    const geometry = new THREE.PlaneGeometry(grid, grid);
    const material = new THREE.MeshBasicMaterial({ color: 0x2b2b2b, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(geometry, material);
    plane.position.set(0, -0.001, 0);
    plane.rotateX(MathUtils.degToRad(90));
    this._scene.add(plane);

    // Light
    const l = new THREE.DirectionalLight(0xffffff, 1);
    l.position.set(0, 5, 10);
    this._scene.add(l);
    const l2 = new THREE.DirectionalLight(0xffffff, 1);
    l2.position.set(0, -5, -10);
    this._scene.add(l2);

    // Manipulator
    this._manipulator = new TransformControls(this._camera, this._renderer.domElement);
    this._manipulator.size = 0.5;
    this._manipulator.setSpace('local');
    this._manipulator.addEventListener('mouseDown', () => {
      if (!this._manipulator) return;
      this._isManipulatorLocked = true;

      if (AM_State.selectedObject instanceof AM_Bone) {
        //const xx = new THREE.Vector3();
        //AM_State.selectedObject.model.worldToLocal(xx);
        //this._manipulatorStartPosition = xx;

        this._manipulatorStartPosition = AM_State.selectedObject.model.position.clone();
        this._manipulatorStartRotation = AM_State.selectedObject.model.quaternion.clone();
        this._manipulatorStartScale = AM_State.selectedObject.model.scale.clone();

        /*this._objectStartPosition = AM_State.selectedObject.positionOffset.clone();
        this._objectStartRotation = AM_State.selectedObject.rotationOffset.clone();
        this._objectStartScale = AM_State.selectedObject.scaleOffset.clone();*/
      } else {
        this._manipulatorStartPosition = this._manipulator.position.clone();
        this._manipulatorStartRotation = this._manipulator.quaternion.clone();
        this._manipulatorStartScale = this._manipulator.scale.clone();
      }
    });
    this._manipulator.addEventListener('change', () => {
      // this.updateTRS();
      if (AM_State.selectedObject instanceof AM_Bone) {
        AM_State.selectedObject.parent.update();
      } else {
        AM_State.selectedObject?.update();
      }
    });
    this._manipulator.addEventListener('mouseUp', () => {
      this.handleTRS();
    });
    this._scene.add(this._manipulator);

    // Ray cast
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    // Inject html
    el.appendChild(this._renderer.domElement);
    this._renderer.domElement.style.position = 'absolute';
    this._renderer.domElement.style.left = '0';
    this._renderer.domElement.style.top = '0';
    this._renderer.domElement.style.zIndex = '0';

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
    document.addEventListener('click', (e: MouseEvent) => {
      if (this._isManipulatorLocked) {
        this._isManipulatorLocked = false;
        return;
      }
      /*if (this._isManipulatorCanUnlock) {
        this._isManipulatorCanUnlock = false;
        this._isManipulatorLocked = false;
      }*/
      if (e.button === 0) {
        raycaster.setFromCamera(pointer, this._camera);

        // Check intersects with bones
        const intersects = raycaster.intersectObjects(
          AM_State.objectList.filter((x) => x.visible).map((x) => x.model),
          true,
        );
        console.log(intersects);
        const bone = intersects.find((x) => x.object.userData.amObject instanceof AM_Bone);

        // Has intersection
        if (intersects[0] || bone) {
          if (bone) AM_State.selectObject(bone.object.userData.amObject);
          else AM_State.selectObject(intersects[0].object.userData.amObject);
        } else {
          AM_State.selectObject(undefined);
        }

        // console.log();
        /*AM_State.selectedBone = undefined;
        this._manipulator.detach();

        if (AM_State.hoverBone) {
          AM_State.selectedBone = AM_State.hoverBone;
          this._manipulator.attach(AM_State.selectedBone.boneHelper);
        }*/
      }
    });

    this.initRenderPass();
  }

  private static initRenderPass() {
    // PP
    this._composer = new EffectComposer(this._renderer);
    this._composer.renderer.outputEncoding = THREE.sRGBEncoding;
    this._composer.setSize(window.innerWidth, window.innerHeight);

    const renderPass = new RenderPass(this._scene, this._camera);
    this._composer.addPass(renderPass);

    this._outlinePass = new OutlinePass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      this._scene,
      this._camera,
    );
    this._outlinePass.pulsePeriod = 0;
    this._outlinePass.usePatternTexture = false;
    this._outlinePass.edgeStrength = 3;
    this._outlinePass.edgeThickness = 0.1;
    this._outlinePass.edgeGlow = 0;
    this._outlinePass.visibleEdgeColor.set('#ff8801');
    //this._outlinePass.hiddenEdgeColor.set('#fe0000');
    this._composer.addPass(this._outlinePass);

    const gammaCorrection = new ShaderPass(GammaCorrectionShader);
    this._composer.addPass(gammaCorrection);
  }

  private static updateTRS(): void {
    if (!this._manipulator) return;
    if (!AM_State.selectedObject) return;
    if (!this._isManipulatorLocked) return;

    // As bone
    if (AM_State.selectedObject instanceof AM_Bone) {
      // Rotation
      if (this._manipulator.mode === 'rotate') {
        const rotDiff = this._manipulatorStartRotation
          .clone()
          .invert()
          .multiply(AM_State.selectedObject.model.quaternion);
        const setRot = this._objectStartRotation.clone().multiply(rotDiff);
        //AM_State.selectedObject.rotationOffset.set(setRot.x, setRot.y, setRot.z, setRot.w);
        AM_State.selectedObject.parent.update();
      }

      // Translate
      if (this._manipulator.mode === 'translate') {
        /*const xx = new THREE.Vector3();
        AM_State.selectedObject.model.worldToLocal(xx);
        console.log(xx);*/

        const posDiff = AM_State.selectedObject.model.position
          .clone()
          .sub(this._manipulatorStartPosition);
        //console.log(posDiff);

        const setPos = this._objectStartPosition.clone().add(posDiff);
        const gg = new THREE.Quaternion();
        AM_State.selectedObject.bone.getWorldQuaternion(gg);

        setPos.applyQuaternion(gg);

        //AM_State.selectedObject.positionOffset.set(setPos.x, setPos.y, setPos.z);
        AM_State.selectedObject.parent.update();
      }

      // Scale
      if (this._manipulator.mode === 'scale') {
        const scaleDiff = AM_State.selectedObject.model.scale.sub(this._manipulatorStartScale);
        const setScale = this._objectStartScale.clone().add(scaleDiff);
        //AM_State.selectedObject.scaleOffset.set(setScale.x, setScale.y, setScale.z);
      }

      //AM_State.selectedObject.update();
      return;
    }

    // Rotation
    if (this._manipulator.mode === 'rotate') {
      AM_State.selectedObject.update();
    }
  }

  private static handleTRS(): void {
    if (!this._manipulator) return;
    if (!AM_State.selectedObject) return;

    // As bone
    if (AM_State.selectedObject instanceof AM_Bone) {
      // Rotation
      if (this._manipulator.mode === 'rotate') {
        /*const rotDiff = this._manipulatorStartRotation
          .clone()
          .invert()
          .multiply(AM_State.selectedObject.model.quaternion);

        AM_State.selectedObject.rotationOffset.multiply(rotDiff);*/
        /*const rot = AM_State.selectedObject.rotationOffset;*/

        AM_State.selectedObject.parent.workingAnimation?.setCurrentKey(
          new AM_KeyQuaternion(
            `bone.${AM_State.selectedObject.name}.rotation`,
            AM_State.selectedObject.rotationOffset,
          ),
        );
      }

      // Translate
      if (this._manipulator.mode === 'translate') {
        /*const xx = new THREE.Vector3();
        AM_State.selectedObject.model.worldToLocal(xx);

        const posDiff = this._manipulatorStartPosition.sub(xx);
        AM_State.selectedObject.positionOffset.add(posDiff);*/

        AM_State.selectedObject.parent.workingAnimation?.setCurrentKey(
          new AM_KeyVector3(
            `bone.${AM_State.selectedObject.name}.position`,
            AM_State.selectedObject.positionOffset,
          ),
        );
      }

      // Scale
      if (this._manipulator.mode === 'scale') {
        // const scaleDiff = AM_State.selectedObject.model.scale.sub(this._manipulatorStartScale);
        // AM_State.selectedObject.scaleOffset.add(scaleDiff);

        AM_State.selectedObject.parent.workingAnimation?.setCurrentKey(
          new AM_KeyVector3(
            `bone.${AM_State.selectedObject.name}.scale`,
            AM_State.selectedObject.scaleOffset,
          ),
        );
      }

      AM_State.selectedObject?.parent.animationController.compile();
      // AM_State.selectedObject?.parent.update();
      AM_State.ui.timeline.refresh();
      return;
    }

    // As other objects

    // Translate
    if (this._manipulator.mode === 'translate') {
      AM_State.selectedObject.workingAnimation?.setCurrentKey(
        new AM_KeyVector3('transform.position', AM_State.selectedObject.model.position),
      );
    }

    // Rotation
    if (this._manipulator.mode === 'rotate') {
      console.log(AM_State.selectedObject.model.quaternion);
      AM_State.selectedObject.workingAnimation?.setCurrentKey(
        new AM_KeyQuaternion('transform.rotation', AM_State.selectedObject.model.quaternion),
      );
    }

    // Scale
    if (this._manipulator.mode === 'scale') {
      AM_State.selectedObject.workingAnimation?.setCurrentKey(
        new AM_KeyVector3('transform.scale', AM_State.selectedObject.model.scale),
      );
    }

    AM_State.selectedObject?.animationController.compile();
    AM_State.selectedObject?.update();
    AM_State.ui.timeline.refresh();
    return;

    // Translate
    /*if (this._manipulator.mode === 'translate') {
      if (AM_State.selectedObject instanceof AM_Bone) {
      } else {
        const pos = AM_State.selectedObject?.model.position;
        if (AM_State.selectedAnimation && pos) {
          AM_State.selectedAnimation.setCurrentKey(new AM_KeyVector3('transform.position', pos));
        }
      }
    }*/

    // Translate
    /*if (this._manipulator.mode === 'translate') {
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
    AM_State.ui.timeline.refresh();*/
  }

  public static destroy(): void {
    this._renderer.dispose();
  }

  public static setManipulatorTo(obj: AM_Object | undefined): void {
    if (!obj) this._manipulator.detach();
    else {
      if (obj instanceof AM_Bone) {
        this._manipulator.attach(obj.bone);
      } else this._manipulator.attach(obj.model);
    }
  }
}
