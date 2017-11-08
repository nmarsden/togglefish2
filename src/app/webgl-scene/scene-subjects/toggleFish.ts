import * as THREE from 'three';

export function ToggleFish(scene) {

  const SIZE: number = 150;

  const COLOUR_TOGGLE_ON: number = 0x5abb5b;
  const COLOUR_TOGGLE_OFF: number = 0xea592e;
  const COLOUR_TOGGLE: number = 0x8A8A8A;


  let isToggleOn: boolean = false;

  // Body
  let bodyMaterial = new THREE.MeshPhongMaterial({ color: COLOUR_TOGGLE_OFF });

  // Fin
  let fin: THREE.Mesh = null;

  // Toggle
  let toggleBaseMaterial = new THREE.MeshPhongMaterial({ color: COLOUR_TOGGLE });
  let toggleBase = new THREE.Mesh(new THREE.BoxGeometry(SIZE / 4, SIZE / 10, SIZE / 4), toggleBaseMaterial);
  toggleBase.position.y = SIZE / 2 + SIZE / 10;
  toggleBase.name = 'toggle';
  toggleBase.castShadow = true;

  let toggleShaftMaterial = new THREE.MeshPhongMaterial({ color: COLOUR_TOGGLE });
  let toggleShaft = new THREE.Mesh(new THREE.BoxGeometry(SIZE / 2, SIZE / 14, SIZE / 2), toggleShaftMaterial);
  toggleShaft.position.y = SIZE / 2 + SIZE / 5;
  toggleShaft.name = 'toggle';
  toggleShaft.castShadow = true;

  let toggle = new THREE.Group();
  toggle.add(toggleBase);
  toggle.add(toggleShaft);

  // Togglefish
  let togglefish = new THREE.Group();
  togglefish.name = 'togglefish';
  togglefish.add(toggle);

  // Add to scene
  scene.add(togglefish);

  let loader = new THREE.ObjectLoader();
  loader.load("../../../assets/togglefish.json",function ( obj ) {

    // Seems like the export to ThreeJS from clara.io rotates the object around the Y-axis by PI
    obj.rotateY(Math.PI);

    // Set child object materials and reset vertex normals
    (obj.children[0] as THREE.Mesh).material = bodyMaterial;
    ((obj.children[0] as THREE.Mesh).geometry as THREE.Geometry).computeFlatVertexNormals();
    (obj.children[1] as THREE.Mesh).material = bodyMaterial;
    ((obj.children[1] as THREE.Mesh).geometry as THREE.Geometry).computeFlatVertexNormals();

    // Body
    let body = (obj.children[0] as THREE.Mesh);
    body.name = 'togglefish-body';

    // Fin
    fin = (obj.children[1] as THREE.Mesh);
    fin.name = 'togglefish-fin';
    // -- alter the fin's pivot axis to be on the edge
    (fin.geometry as THREE.Geometry).translate(0, -25, 0);
    fin.translateY(25);

    togglefish.add(obj);
  });

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

    // Rotate fin
    let finAngle = time % (2 * Math.PI);
    fin.rotation.x =  (Math.cos(finAngle) * Math.PI/4) - Math.PI/2;
  };

  this.toggle = function() {
    isToggleOn = !isToggleOn;
    bodyMaterial.color.setHex( isToggleOn ? COLOUR_TOGGLE_ON : COLOUR_TOGGLE_OFF );
  };
}
