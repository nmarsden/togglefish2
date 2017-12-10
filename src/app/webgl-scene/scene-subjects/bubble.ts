import {Mesh, MeshPhongMaterial, Scene, SphereGeometry} from "three";
import {AlertService} from "../../service/alert.service";

export function Bubble(scene: Scene, alertService: AlertService, options ) {

  const COLOUR_BUBBLE: number = 0xb5cde5;
  const IS_WIREFRAME: boolean = false;

  let isDelayed = true;
  let bubbleMaterial = new MeshPhongMaterial({ color: COLOUR_BUBBLE, transparent: true, opacity: 0.3, wireframe: IS_WIREFRAME });
  let bubbleMesh = new Mesh(new SphereGeometry(5, 8, 8), bubbleMaterial);
  bubbleMesh.name = `togglefish_bubble`;
  bubbleMesh.castShadow = true;
  bubbleMesh.visible = false;
  scene.add(bubbleMesh);

  // TODO the properties of this bubble object can simply be variables of the Bubble
  let bubble = {
    mesh: bubbleMesh,
    isAnimating: false,
    mouth: options.mouth,
    delaySecs: options.delaySecs,
    animStartTime: null,
    animEndTime: null,
    durationSecs: 7
  };


  this.update = function(time, mouseDownPos) {

    // Initialize animation end time
    if (bubble.animEndTime == null) {
      bubble.animEndTime = time;
    }

    // Check if animation is delayed
    if (isDelayed) {
      if ((time - bubble.animEndTime) > bubble.delaySecs) {
        isDelayed = false;
      } else {
        return;
      }
    }

    if (!bubble.isAnimating) {

      // Check if the animation duration has not been reached yet
      if (bubble.animStartTime !== null && (time - bubble.animStartTime) < bubble.durationSecs) {
        return;
      }

      // Initialize bubble animation
      scene.updateMatrixWorld(true);

      bubble.mesh.position.setFromMatrixPosition(bubble.mouth.mouthTop.matrixWorld);
      bubble.mesh.position.multiplyScalar((bubble.mesh.position.length() + 20) / bubble.mesh.position.length());
      bubble.mesh.visible = true;
      bubble.isAnimating = true;
      bubble.animStartTime = time;
    } else {
      // Animate bubble
      let bubblePosY = bubble.mesh.position.y + 1;
      if (bubblePosY > 250) {
        // End bubble animation
        bubble.mesh.visible = false;
        bubble.animEndTime = time;
        bubble.isAnimating = false;
      } else {
        bubble.mesh.position.setY(bubblePosY);
      }
    }

  };
}
