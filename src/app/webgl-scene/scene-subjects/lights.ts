import * as THREE from 'three';

export function Lights(scene) {

  let ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  ambientLight.name = 'ambient light';
  scene.add(ambientLight);

  let shadowLight = new THREE.DirectionalLight(0xffffff, 1);
  shadowLight.name = 'shadow light';
  shadowLight.position.set(0, 300, 100);
  scene.add(shadowLight);

  // Allow shadow casting
  shadowLight.castShadow = true;

  // define the visible area of the projected shadow
  const SIZE = 400;
  shadowLight.shadow.camera.left = -SIZE;
  shadowLight.shadow.camera.right = SIZE;
  shadowLight.shadow.camera.top = SIZE;
  shadowLight.shadow.camera.bottom = -SIZE;
  shadowLight.shadow.camera.near = 1;
  shadowLight.shadow.camera.far = 1000;

  // define the resolution of the shadow; the higher the better,
  // but also the more expensive and less performant
  shadowLight.shadow.mapSize.width = 2048;
  shadowLight.shadow.mapSize.height = 2048;

  // Create a helper for the shadow camera
  // var helper = new THREE.CameraHelper( shadowLight.shadow.camera );
  // scene.add( helper );

  // Create a helper for the light
  // let dirLightHelper = new THREE.DirectionalLightHelper( shadowLight, 10 );
  // scene.add( dirLightHelper );

  this.update = function(time, mousePos) {
  }
}
