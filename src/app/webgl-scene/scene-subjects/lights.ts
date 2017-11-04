import * as THREE from 'three';

export function Lights(scene) {

  let ambientLight = new THREE.AmbientLight(0xff5555, 0.2);
  ambientLight.name = 'ambient light';
  scene.add(ambientLight);

  let directionalLight = new THREE.DirectionalLight(0xff0000, 1.0);
  directionalLight.name = 'directional light';
  directionalLight.position.set(300, 300, 300);
  scene.add(directionalLight);

  let directionalLight2 = new THREE.DirectionalLight(0xff0000, 1.0);
  directionalLight2.name = 'directional light 2';
  directionalLight2.position.set(-300, 300, -300);
  scene.add(directionalLight2);

  this.update = function(time) {
    directionalLight.intensity = (Math.sin(time)+1.5)/1.5;
    directionalLight.color.setHSL( Math.sin(time), 0.5, 0.5 );
  }
}
