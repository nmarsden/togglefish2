import * as THREE from 'three';

export function Ground(scene) {

  const SIZE: number = 800;

  // Ground
  let groundMaterial = new THREE.MeshPhongMaterial({ color: 0xFFDA77 });
  let ground = new THREE.Mesh(new THREE.BoxGeometry(SIZE, 20, SIZE), groundMaterial);
  ground.name = 'ground';
  ground.position.y = -250;

  // Allow the ground to receive shadows
  ground.receiveShadow = true;

  // Add to scene
  scene.add(ground);


  this.update = function(time, mousePos) {
  };
}
