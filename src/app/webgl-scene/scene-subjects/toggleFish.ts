import * as threejs from 'three';
import {
  Scene, Color, Box2, MeshPhongMaterial, Mesh, Group, LoadingManager, BufferGeometry, Geometry, AxisHelper,
  Object3D, Vector3, SceneUtils, SphereGeometry
} from 'three';

import { AlertService } from '../../service/index';
import OBJLoader from 'three-obj-loader';
OBJLoader(threejs);

export function ToggleFish(scene: Scene, alertService: AlertService) {

  this.alertService = alertService;

  const COLOUR_TOGGLE_ON: Color = new Color(0x5abb5b);
  const COLOUR_TOGGLE_OFF: Color = new Color(0xea592e);

  const COLOUR_TOGGLE: number = 0x8A8A8A;

  const COLOUR_EYE_BROW: number = 0x000000;
  const COLOUR_EYE_BALL: number = 0xFFFFFF;
  const COLOUR_EYE_PUPIL: number = 0x000000;

  const COLOUR_BUBBLE: number = 0xb5cde5;

  const IS_WIREFRAME: boolean = false;

  let isFinishedLoading: boolean = false;
  let isToggleOn: boolean = true;
  let isToggleAnimating: boolean = false;
  let farPlaneVertices: Box2;

  let isInitialUpdate = true;

  // Body
  let bodyMaterial = new MeshPhongMaterial({color: COLOUR_TOGGLE_ON, wireframe: IS_WIREFRAME});

  // Fins
  let finRight: Mesh = null;
  let finLeft: Mesh = null;
  let finTail: Mesh = null;

  // Eyes
  let eyeBrowMaterial = new MeshPhongMaterial({color: COLOUR_EYE_BROW, wireframe: IS_WIREFRAME});
  let eyeBallMaterial = new MeshPhongMaterial({color: COLOUR_EYE_BALL, wireframe: IS_WIREFRAME});
  let eyePupilMaterial = new MeshPhongMaterial({color: COLOUR_EYE_PUPIL, wireframe: IS_WIREFRAME});
  let eyeRight: Mesh = null;
  let eyeLeft: Mesh = null;

  // Mouth
  let mouthTop: Mesh = null;

  // Toggle
  let toggleMaterial = new MeshPhongMaterial({color: COLOUR_TOGGLE, wireframe: IS_WIREFRAME});
  let toggleShaft: Mesh = null;

  // Bubble
  let bubbleMaterial = new MeshPhongMaterial({ color: COLOUR_BUBBLE, transparent: true, opacity: 0.3, wireframe: IS_WIREFRAME });
  let bubble = new Mesh(new SphereGeometry(5, 8, 8), bubbleMaterial);
  bubble.name = 'togglefish_bubble';
  bubble.castShadow = true;
  scene.add(bubble);

  // Togglefish
  let togglefish = new Group();
  togglefish.name = 'togglefish';
  togglefish.visible = true;

  // Add to scene
  scene.add(togglefish);

  var manager = new LoadingManager();
  this.threejs = threejs;
  let loader = new this.threejs.OBJLoader(manager);
  loader.load("assets/togglefish.obj", (obj) => {

    // console.log('obj', obj);

    // Set material and reset vertex normals for all Mesh objects
    obj.traverse((obj) => {
      if (obj instanceof Mesh) {
        obj.material = bodyMaterial;
        obj.castShadow = true;
        obj.receiveShadow = true;
        (obj.geometry as BufferGeometry).computeVertexNormals();

        // obj.add(new AxisHelper(500));
        // this.alertService.info(obj.name);
      }
    });

    // Toggle
    this.getChildByName(obj,'togglefish_toggle_base').material = toggleMaterial;
    toggleShaft = this.getChildByName(obj, 'togglefish_toggle_shaft');
    toggleShaft.material = toggleMaterial;
    let toggleTip = this.getChildByName(obj, 'togglefish_toggle_tip');
    toggleTip.material = toggleMaterial;
    this.attachChildrenToParent(scene, obj, new Vector3(0, 75, 0), toggleShaft, toggleTip);
    toggleShaft.rotation.x = Math.PI/5;

    // Fin Right
    finRight = this.getChildByName(obj, 'togglefish_fin_right');
    this.updatePivotPoint(finRight, -75, 0, 0);

    // Fin Left
    finLeft = this.getChildByName(obj, 'togglefish_fin_left');
    this.updatePivotPoint(finLeft, 75, 0, 0);

    // Fin Tail
    finTail = this.getChildByName(obj, 'togglefish_fin_tail');
    this.updatePivotPoint(finTail, 0, 0, -140);

    // Eye Right
    eyeRight = this.getChildByName(obj, 'togglefish_eye_right');
    this.getChildByName(obj, 'togglefish_eye_right_brow').material = eyeBrowMaterial;
    let eyeBallRight = this.getChildByName(obj, 'togglefish_eye_right_ball');
    eyeBallRight.material = eyeBallMaterial;
    let eyePupilRight = this.getChildByName(obj, 'togglefish_eye_right_pupil');
    eyePupilRight.material = eyePupilMaterial;
    this.attachChildrenToParent(scene, obj, new Vector3(-35, 35, 100), eyeRight, eyeBallRight, eyePupilRight);

    // Eye Left
    eyeLeft = this.getChildByName(obj, 'togglefish_eye_left');
    this.getChildByName(obj, 'togglefish_eye_left_brow').material = eyeBrowMaterial;
    let eyeBallLeft = this.getChildByName(obj, 'togglefish_eye_left_ball');
    eyeBallLeft.material = eyeBallMaterial;
    let eyePupilLeft = this.getChildByName(obj, 'togglefish_eye_left_pupil');
    eyePupilLeft.material = eyePupilMaterial;
    this.attachChildrenToParent(scene, obj, new Vector3(35, 35, 100), eyeLeft, eyeBallLeft, eyePupilLeft);

    // Mouth
    mouthTop = this.getChildByName(obj, 'togglefish_mouth_top');
    this.updatePivotPointToCenter(mouthTop);

    // Add edges geometry (Note: shows edges as black lines)
    // obj.traverse( (obj) => {
    //   if (obj instanceof Mesh) {
    //     let geometry = new EdgesGeometry( obj.geometry, 1 );
    //     let material = new LineBasicMaterial( { color: 0x000000, linewidth: 4 } );
    //     let edges = new LineSegments( geometry, material );
    //     obj.add( edges ); // add wireframe as a child of the parent mesh
    //   }
    // });

    togglefish.add(obj);

    isFinishedLoading = true;
  });

  this.attachChildrenToParent = function(scene: Scene, rootObj: Object3D, pivotPoint: Vector3, parent: Object3D, ...children: Object3D[]) {
    this.updatePivotPoint(parent, pivotPoint.x, pivotPoint.y, pivotPoint.z);

    children.map((child: Object3D) => {
      SceneUtils.detach ( child, rootObj, scene );
      SceneUtils.attach ( child, scene, parent );
      child.translateX(-pivotPoint.x);
      child.translateY(-pivotPoint.y);
      child.translateZ(-pivotPoint.z);
    });
  };

  this.logObject = function(obj: Object3D, name: String) {
    // this.alertService.clear();
    this.alertService.info(`${name} - position: (${obj.position.x}, ${obj.position.y}, ${obj.position.z})`);
    this.alertService.info(`${name} - rotation: (${obj.rotation.x}, ${obj.rotation.y}, ${obj.rotation.z})`);

    let worldPos = obj.position.clone();
    obj.localToWorld( worldPos );
    this.alertService.info(`${name} - world position: (${worldPos.x.toFixed(2)}, ${worldPos.y.toFixed(2)}, ${worldPos.z.toFixed(2)})`);
  };

  this.updatePivotPointToCenter = function(obj: Mesh) {
    obj.geometry.computeBoundingSphere();
    let center = obj.geometry.boundingSphere.center;
    this.updatePivotPoint(obj, center.x, center.y, center.z);
  };

  this.updatePivotPoint = function(obj: Mesh, x: number, y: number, z: number) {
    (obj.geometry as THREE.Geometry).translate(-x, -y, -z);
    obj.translateX(x);
    obj.translateY(y);
    obj.translateZ(z);
  };

  this.getChildByName = function(obj: Object3D, name: String): Mesh {
    return obj.children.find((child: Object3D) => {
      return child.name === name;
    }) as Mesh;
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
      toggleShaft.rotation.x += (targetToggleRotation - toggleShaft.rotation.x) * 0.05;

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
    finRight.rotation.z =  (Math.cos(finAngle) * Math.PI/4);
    finLeft.rotation.z =  (Math.cos(finAngle + Math.PI) * Math.PI/4);
    finTail.rotation.y =  (Math.cos(finAngle) * Math.PI/4);

    // Rotate eyes to look at target
    let eyeTargetX = this.normalize(mouseDownPos.x, -1, 1, farPlaneVertices.min.x, farPlaneVertices.max.x);
    let eyeTargetY = 35;
    let eyeTargetZ = 300;

    let eyeRightTargetVector = new Vector3(this.threejs.Math.clamp(eyeTargetX, -150, 50), eyeTargetY, eyeTargetZ);
    let eyeLeftTargetVector = new Vector3(this.threejs.Math.clamp(eyeTargetX, -50, 150), eyeTargetY, eyeTargetZ);
    eyeRight.lookAt( eyeRightTargetVector );
    eyeLeft.lookAt( eyeLeftTargetVector );

    // Animate bubble
    if (isInitialUpdate) {
      scene.updateMatrixWorld(true);
      this.setBubbleInitialPosition(mouthTop);
    }

    let bubblePosY = bubble.position.y + 1;
    if (bubblePosY > 400) {
      this.setBubbleInitialPosition(mouthTop);
    } else {
      bubble.position.setY(bubblePosY);
    }
    isInitialUpdate = false;
  };

  this.setBubbleInitialPosition = function(mouthTop: Mesh) {
    bubble.position.setFromMatrixPosition( mouthTop.matrixWorld );
    bubble.position.setZ(bubble.position.z + 30);
  };

  this.toggle = function() {
    isToggleOn = !isToggleOn;
    isToggleAnimating = true;
  };

  this.setFarPlaneVertices = function(updatedFarPlaneVertices: Box2) {
    farPlaneVertices = updatedFarPlaneVertices;
  }
}
