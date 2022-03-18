import * as THREE from 'three';

export class SceneNavigation {
  private static _camera: THREE.PerspectiveCamera;
  private static _keys: Record<string, boolean> = {};
  private static _zoom = 5;
  private static _rotationX = 0;
  private static _rotationY = 0;
  private static _isDrag = false;
  private static _dragStart = { x: 0, y: 0 };
  private static _dragDelta = { x: 0, y: 0 };

  public static init(camera: THREE.PerspectiveCamera): void {
    this._camera = camera;

    document.addEventListener('keydown', (e: KeyboardEvent) => {
      this._keys[e.key] = true;
    });
    document.addEventListener('keyup', (e: KeyboardEvent) => {
      this._keys[e.key] = false;
    });

    document.addEventListener('mousedown', (e: MouseEvent) => {
      this._isDrag = true;
      this._dragStart.x = e.pageX;
      this._dragStart.y = e.pageY;
    });
    document.addEventListener('mouseup', (e: MouseEvent) => {
      this._isDrag = false;
    });
    document.addEventListener('mousemove', (e: MouseEvent) => {
      this._dragDelta.x = e.pageX - this._dragStart.x;
      this._dragDelta.y = this._dragStart.y - e.pageY;
      this._dragStart.x = e.pageX;
      this._dragStart.y = e.pageY;
    });
    document.addEventListener('wheel', (e: WheelEvent) => {
      const power = e.deltaY > 0 ? 1 : -1;
      this._zoom += power * 0.2;
      // this._camera.position.z += power * 0.2;
    });
  }

  public static tick(): void {
    /*if (this._keys['w']) {
      this._camera.position.z -= 0.1;
    }
    if (this._keys['s']) {
      this._camera.position.z += 0.1;
    }
    if (this._keys['a']) {
      this._camera.position.x -= 0.1;
    }
    if (this._keys['d']) {
      this._camera.position.x += 0.1;
    }

    if (this._isDrag) {
      this._camera.position.x -= 0.1;
    }*/

    if (this._isDrag) {
      this._rotationY -= this._dragDelta.x * 0.02;
      this._rotationX += this._dragDelta.y * 0.02;
    }

    const t = new THREE.Matrix4().makeTranslation(0, 0, this._zoom);
    const qq = new THREE.Quaternion(0, 0, 0, 0).setFromEuler(
      new THREE.Euler(this._rotationX, this._rotationY, 0),
    );
    const r = new THREE.Matrix4().makeRotationFromQuaternion(qq);

    const fuck = r.multiply(t);

    let p = new THREE.Vector3();
    p = p.setFromMatrixPosition(fuck);
    // console.log(p);
    /*let m = new THREE.Matrix4();
    m = m.identity();
    m = m
      .makeTranslation(0, 0, this._zoom)
      .makeRotationFromEuler(new THREE.Euler(this._rotationX, 0, 0));
    console.log(m);*/

    //let p = new THREE.Vector3();
    //p = p.setFromMatrixPosition(m);

    this._camera.position.x = p.x;
    this._camera.position.y = p.y;
    this._camera.position.z = p.z;
    // this._camera.position.z = p.z;

    //console.log(p);
    /*const cos = Math.cos(radians);
    const sin = Math.sin(radians);

    this._camera.position.x = Math.sin((this._rotationX / 180) * Math.PI) * this._zoom;
    this._camera.position.z = -Math.cos((this._rotationY / 180) * Math.PI) * this._zoom;*/

    this._camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Clear drag
    this._dragDelta.x = 0;
    this._dragDelta.y = 0;
  }
}
