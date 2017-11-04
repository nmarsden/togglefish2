import * as THREE from 'three';

export function ToggleFish(scene) {

  const size = 200;
  const rotationSpeedX: number = 0.005;
  const rotationSpeedY: number = 0.01;

  let material = new THREE.MeshPhongMaterial({ color: 0xaaaaaa });
  let cube = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), material);
  cube.name = 'togglefish';
  scene.add(cube);

  this.update = function(time) {
    cube.rotation.x += rotationSpeedX;
    cube.rotation.y += rotationSpeedY;
  }
}
