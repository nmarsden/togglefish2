import * as THREE from 'three';

export function ToggleFish(scene) {

  const SIZE: number = 200;

  const COLOUR_TOGGLE_ON: number = 0x5abb5b;
  const COLOUR_TOGGLE_OFF: number = 0xea592e;
  const COLOUR_TOGGLE: number = 0x8A8A8A;


  let isToggleOn: boolean = false;

  // Body
  let bodyMaterial = new THREE.MeshPhongMaterial({ color: COLOUR_TOGGLE_OFF });
  let body = new THREE.Mesh(new THREE.BoxGeometry(SIZE, SIZE, SIZE), bodyMaterial);

  // Toggle
  let toggleBaseMaterial = new THREE.MeshPhongMaterial({ color: COLOUR_TOGGLE });
  let toggleBase = new THREE.Mesh(new THREE.BoxGeometry(SIZE / 4, SIZE / 10, SIZE / 4), toggleBaseMaterial);
  toggleBase.position.y = SIZE / 2 + SIZE / 10;
  toggleBase.name = 'toggle';

  let toggleShaftMaterial = new THREE.MeshPhongMaterial({ color: COLOUR_TOGGLE });
  let toggleShaft = new THREE.Mesh(new THREE.BoxGeometry(SIZE / 2, SIZE / 14, SIZE / 2), toggleShaftMaterial);
  toggleShaft.position.y = SIZE / 2 + SIZE / 5;
  toggleShaft.name = 'toggle';

  let toggle = new THREE.Group();
  toggle.add(toggleBase);
  toggle.add(toggleShaft);

  // Togglefish
  let togglefish = new THREE.Group();
  togglefish.add(body);
  togglefish.add(toggle);

  // Add to scene
  scene.add(togglefish);

  this.normalize = function(v, vmin, vmax, tmin, tmax) {
    let nv = Math.max(Math.min(v, vmax), vmin);
    let dv = vmax - vmin;
    let pc = (nv - vmin) / dv;
    let dt = tmax - tmin;
    let tv = tmin + (pc * dt);
    return tv;
  };

  this.update = function(time, mousePos) {
    // Move a fraction towards the desired position
    // Restricting movement between -100 and 100 on the horizontal and vertical axis,
    const RANGE = 100;

    let targetX = this.normalize(mousePos.x, -1, 1, -RANGE, RANGE);
    let targetY = this.normalize(mousePos.y, -1, 1, -RANGE, RANGE);
    togglefish.position.x += (targetX - togglefish.position.x) * 0.1;
    togglefish.position.y += (targetY - togglefish.position.y) * 0.1;

    // Rotate a fraction towards the desired rotation
    // Restricting rotation between -0.5 and 0.5 on the horizontal and vertical axis,
    let rotationX = -1 * this.normalize(mousePos.y, -1, 1, -0.5, 0.5);
    let rotationY = this.normalize(mousePos.x, -1, 1, -0.5, 0.5);
    togglefish.rotation.x += (rotationX - togglefish.rotation.x) * 0.1;
    togglefish.rotation.y += (rotationY - togglefish.rotation.y) * 0.1;
  };

  this.toggle = function() {
    isToggleOn = !isToggleOn;
    bodyMaterial.color.setHex( isToggleOn ? COLOUR_TOGGLE_ON : COLOUR_TOGGLE_OFF );
  };
}
