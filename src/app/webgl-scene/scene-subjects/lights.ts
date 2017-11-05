import * as THREE from 'three';

export function Lights(scene) {

  let ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
  ambientLight.name = 'ambient light';
  scene.add(ambientLight);

  let directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
  directionalLight.name = 'directional light';
  directionalLight.position.set(300, 300, 300);
  scene.add(directionalLight);

  let directionalLight2 = new THREE.DirectionalLight(0xffffff, 1.0);
  directionalLight2.name = 'directional light 2';
  directionalLight2.position.set(-300, 300, -300);
  scene.add(directionalLight2);

  this.update = function(time, mousePos) {
  }
}
