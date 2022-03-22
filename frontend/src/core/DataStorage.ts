import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';

export class DataStorage {
  public static manipulator: TransformControls;
  public static hoverObject?: THREE.Object3D;
  public static selectedObject?: THREE.Object3D;

  public static manipulatorStartPosition: THREE.Vector3;
  public static manipulatorStartRotation: THREE.Quaternion;

  public static isLockManipulator = false;

  public static selectedTimelineLayer = '';

  public static setManipulatorTo(obj?: THREE.Object3D): void {
    DataStorage.manipulator.detach();
    if (obj) DataStorage.manipulator.attach(obj);
  }
}
