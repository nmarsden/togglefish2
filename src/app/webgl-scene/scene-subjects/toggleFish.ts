import * as THREE from 'three';

export function ToggleFish(scene) {

  const COLOUR_TOGGLE_ON: THREE.Color = new THREE.Color(0x5abb5b);
  const COLOUR_TOGGLE_OFF: THREE.Color = new THREE.Color(0xea592e);

  const COLOUR_TOGGLE: number = 0x8A8A8A;
  const COLOUR_EYE_BALL: number = 0xFFFFFF;
  const COLOUR_EYE_PUPIL: number = 0x000000;

  let isFinishedLoading: boolean = false;
  let isToggleOn: boolean = true;
  let isToggleAnimating: boolean = false;
  let farPlaneVertices: THREE.Box2;

  // Body
  let bodyMaterial = new THREE.MeshPhongMaterial({ color: COLOUR_TOGGLE_ON });

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
  let toggleMaterial = new THREE.MeshPhongMaterial({ color: COLOUR_TOGGLE });
  let toggleShaft: THREE.Mesh = null;

  // Togglefish
  let togglefish = new THREE.Group();
  togglefish.name = 'togglefish';

  // Add to scene
  scene.add(togglefish);

  let loader = new THREE.ObjectLoader();
  loader.load("assets/togglefish.json", ( obj ) => {

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

    // Toggle
    let toggle = this.getChildByName(obj, 'togglefish_toggle');
    toggle.getChildByName('togglefish_toggle_base').material = toggleMaterial;

    toggleShaft = this.getChildByName(toggle, 'togglefish_toggle_shaft');
    toggleShaft.material = toggleMaterial;
    (toggleShaft.geometry as THREE.Geometry).translate(0, 0, 25);
    toggleShaft.translateZ(-25);
    toggleShaft.rotation.y = Math.PI/5;

    let toggleTip = this.getChildByName(toggleShaft, 'togglefish_toggle_tip');
    toggleTip.material = toggleMaterial;
    toggleTip.translateZ(25);

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

    // Add edges geometry (Note: shows edges as black lines)
    // obj.traverse( (obj) => {
    //   if (obj instanceof THREE.Mesh) {
    //     let geometry = new THREE.EdgesGeometry( obj.geometry, 1 );
    //     let material = new THREE.LineBasicMaterial( { color: 0x000000, linewidth: 4 } );
    //     let edges = new THREE.LineSegments( geometry, material );
    //     obj.add( edges ); // add wireframe as a child of the parent mesh
    //   }
    // });

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
    // Restricting movement between a small fraction of the far plane's horizontal and vertical axis,
    let targetX = this.normalize(mouseDownPos.x, -1, 1, farPlaneVertices.min.x * 0.05, farPlaneVertices.max.x * 0.05);
    let targetY = this.normalize(mouseDownPos.y, -1, 1, farPlaneVertices.min.y * 0.05, farPlaneVertices.max.y * 0.05);
    togglefish.position.x += (targetX - togglefish.position.x) * 0.1;
    togglefish.position.y += (targetY - togglefish.position.y) * 0.1;

    // Rotate fish a fraction towards the desired rotation
    // Restricting rotation between -0.5 and 0.5 on the horizontal and vertical axis,
    const ROTATION_RANGE = 0.5;
    let rotationX = -1 * this.normalize(mouseDownPos.y, -1, 1, -ROTATION_RANGE, ROTATION_RANGE);
    let rotationY = this.normalize(mouseDownPos.x, -1, 1, -ROTATION_RANGE, ROTATION_RANGE);
    togglefish.rotation.x += (rotationX - togglefish.rotation.x) * 0.1;
    togglefish.rotation.y += (rotationY - togglefish.rotation.y) * 0.1;

    if (!isFinishedLoading) {
      return;
    }

    // Animate toggle
    if (isToggleAnimating) {
      // Rotate toggle shaft
      const TOGGLE_ROTATION_RANGE = Math.PI/5;
      let targetToggleRotation = isToggleOn ? TOGGLE_ROTATION_RANGE : -TOGGLE_ROTATION_RANGE;
      toggleShaft.rotation.y += (targetToggleRotation - toggleShaft.rotation.y) * 0.05;

      // Alter body color towards target color
      let targetColor = isToggleOn ? COLOUR_TOGGLE_ON : COLOUR_TOGGLE_OFF;
      bodyMaterial.color.r += (targetColor.r - bodyMaterial.color.r) * 0.05;
      bodyMaterial.color.g += (targetColor.g - bodyMaterial.color.g) * 0.05;
      bodyMaterial.color.b += (targetColor.b - bodyMaterial.color.b) * 0.05;

      // Check for end of animation
      if (Math.abs(targetToggleRotation - toggleShaft.rotation.y) < 0.01) {
        isToggleAnimating = false;
      }
    }

    // Animate fins
    let finAngle = time % (2 * Math.PI);
    finRight.rotation.x =  (Math.cos(finAngle) * Math.PI/4) - Math.PI/2;
    finLeft.rotation.x =  (Math.cos(finAngle + Math.PI) * Math.PI/4) - Math.PI/2;
    finTail.rotation.z =  (Math.cos(finAngle) * Math.PI/4) + Math.PI;

    // Rotate eyes to look at target
    let eyeTargetX = this.normalize(mouseDownPos.x, -1, 1, farPlaneVertices.min.x, farPlaneVertices.max.x);
    let eyeTargetY = 40;
    let eyeTargetZ = 800;

    let eyeTargetVector = new THREE.Vector3(eyeTargetX, eyeTargetY, eyeTargetZ);
    eyeRight.lookAt( eyeTargetVector );
    eyeLeft.lookAt( eyeTargetVector );
  };

  this.toggle = function() {
    isToggleOn = !isToggleOn;
    isToggleAnimating = true;
  };

  this.setFarPlaneVertices = function(updatedFarPlaneVertices: THREE.Box2) {
    farPlaneVertices = updatedFarPlaneVertices;
  }
}
