import * as THREE from 'three';

export function ToggleFish(scene) {

  const size = 200;
  const rotationSpeedX: number = 0.005;
  const rotationSpeedY: number = 0.01;
  const COLOUR_TOGGLE_ON = 0xaaaaaa;
  const COLOUR_TOGGLE_OFF = 0x110000;

  let isToggleOn = false;

  let material = new THREE.MeshPhongMaterial({ color: COLOUR_TOGGLE_OFF });
  let cube = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), material);
  cube.name = 'togglefish';
  scene.add(cube);

  this.update = function(time) {
    cube.rotation.x += rotationSpeedX;
    cube.rotation.y += rotationSpeedY;
  };

  this.toggle = function() {
    isToggleOn = !isToggleOn;
    material.color.setHex( isToggleOn ? COLOUR_TOGGLE_ON : COLOUR_TOGGLE_OFF );
  };
}
