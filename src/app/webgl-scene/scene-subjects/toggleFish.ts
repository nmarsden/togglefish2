import * as THREE from 'three';

export function ToggleFish(scene) {

  const SIZE: number = 150;

  const COLOUR_TOGGLE_ON: number = 0x5abb5b;
  const COLOUR_TOGGLE_OFF: number = 0xea592e;
  const COLOUR_TOGGLE: number = 0x8A8A8A;
  const COLOUR_EYE_BALL: number = 0xFFFFFF;
  const COLOUR_EYE_PUPIL: number = 0x000000;

  let isFinishedLoading: boolean = false;
  let isToggleOn: boolean = false;

  // Body
  let bodyMaterial = new THREE.MeshPhongMaterial({ color: COLOUR_TOGGLE_OFF });

  // Fins
  let finRight: THREE.Mesh = null;
  let finLeft: THREE.Mesh = null;
  let finTail: THREE.Mesh = null;

  // Eyes
  let eyeBallMaterial = new THREE.MeshPhongMaterial({ color: COLOUR_EYE_BALL });
  let eyePupilMaterial = new THREE.MeshPhongMaterial({ color: COLOUR_EYE_PUPIL });
  let eyeRight: THREE.Mesh = null;
  let eyeLeft: THREE.Mesh = null;

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
  loader.load("../../../assets/togglefish.json", ( obj ) => {

    // Seems like the export to ThreeJS from clara.io rotates the object around the Y-axis by PI
    // obj.rotateY(Math.PI); // Face right
    // obj.rotateY(-Math.PI/2); // Face back
    obj.rotateY(Math.PI/2); // Face front

    // Set material and reset vertex normals for all Mesh objects
    obj.traverse( (obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.material = bodyMaterial;
        (obj.geometry as THREE.Geometry).computeFlatVertexNormals()
      }
    });

    // Fin Right
    finRight = this.getChildByName(obj, 'togglefish_fin_right');
    // -- alter the finRight's pivot axis to be on the edge
    (finRight.geometry as THREE.Geometry).translate(0, -25, 0);
    finRight.translateY(25);

    // Fin Left
    finLeft = this.getChildByName(obj, 'togglefish_fin_left');
    // -- alter the finLeft's pivot axis to be on the edge
    (finLeft.geometry as THREE.Geometry).translate(0, 25, 0);
    finLeft.translateY(-25);

    // Fin Tail
    finTail = this.getChildByName(obj, 'togglefish_fin_tail');
    // -- alter the finTail's pivot axis to be on the edge
    (finTail.geometry as THREE.Geometry).translate(-25, 0, 0);
    finTail.translateX(25);

    // Eye Right
    eyeRight = this.getChildByName(obj, 'togglefish_eye_right');
    eyeRight.up.set(0, -1, 0);
    let eyeBallRight = this.getChildByName(eyeRight, 'togglefish_eye_right_ball');
    eyeBallRight.material = eyeBallMaterial;
    let eyePupilRight = this.getChildByName(eyeRight, 'togglefish_eye_right_pupil');
    eyePupilRight.material = eyePupilMaterial;

    // Eye Left
    eyeLeft = this.getChildByName(obj, 'togglefish_eye_left');
    eyeLeft.up.set(0, -1, 0);
    let eyeBallLeft = this.getChildByName(eyeLeft, 'togglefish_eye_left_ball');
    eyeBallLeft.material = eyeBallMaterial;
    let eyePupilLeft = this.getChildByName(eyeLeft, 'togglefish_eye_left_pupil');
    eyePupilLeft.material = eyePupilMaterial;

    togglefish.add(obj);

    isFinishedLoading = true;
  });

  this.getChildByName = function(obj: THREE.Object3D, name: String): THREE.Mesh {
    return obj.children.find((child: THREE.Object3D) => {
      return child.name === name;
    }) as THREE.Mesh;
  };

  this.normalize = function(v, vmin, vmax, tmin, tmax) {
    let nv = Math.max(Math.min(v, vmax), vmin);
    let dv = vmax - vmin;
    let pc = (nv - vmin) / dv;
    let dt = tmax - tmin;
    let tv = tmin + (pc * dt);
    return tv;
  };

  this.update = function(time, mouseDownPos) {
    // Move fish a fraction towards the desired position
    // Restricting movement between -100 and 100 on the horizontal and vertical axis,
    const RANGE = 100;

    let targetX = this.normalize(mouseDownPos.x, -1, 1, -RANGE, RANGE);
    let targetY = this.normalize(mouseDownPos.y, -1, 1, -RANGE, RANGE);
    togglefish.position.x += (targetX - togglefish.position.x) * 0.1;
    togglefish.position.y += (targetY - togglefish.position.y) * 0.1;

    // Rotate fish a fraction towards the desired rotation
    // Restricting rotation between -0.5 and 0.5 on the horizontal and vertical axis,
    let rotationX = -1 * this.normalize(mouseDownPos.y, -1, 1, -0.5, 0.5);
    let rotationY = this.normalize(mouseDownPos.x, -1, 1, -0.5, 0.5);
    togglefish.rotation.x += (rotationX - togglefish.rotation.x) * 0.1;
    togglefish.rotation.y += (rotationY - togglefish.rotation.y) * 0.1;

    if (!isFinishedLoading) {
      return;
    }

    // Animate fins
    let finAngle = time % (2 * Math.PI);
    finRight.rotation.x =  (Math.cos(finAngle) * Math.PI/4) - Math.PI/2;
    finLeft.rotation.x =  (Math.cos(finAngle + Math.PI) * Math.PI/4) - Math.PI/2;
    finTail.rotation.z =  (Math.cos(finAngle) * Math.PI/4) + Math.PI;

    // Rotate eyes to look at target
    const EYE_RANGE = 1000;
    let eyeTargetX = this.normalize(mouseDownPos.x, -1, 1, -EYE_RANGE, EYE_RANGE);
    let eyeTargetY = 0;
    let eyeTargetVector = new THREE.Vector3(eyeTargetX, eyeTargetY, EYE_RANGE);
    eyeRight.lookAt( eyeTargetVector );
    eyeLeft.lookAt( eyeTargetVector );
  };

  this.toggle = function() {
    isToggleOn = !isToggleOn;
    bodyMaterial.color.setHex( isToggleOn ? COLOUR_TOGGLE_ON : COLOUR_TOGGLE_OFF );
  };
}
