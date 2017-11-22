import { AfterViewInit, Component, ElementRef, Input, ViewChild, Inject } from '@angular/core';
import { AlertService } from '../service/index';
import * as THREE from 'three';
import { Lights } from './scene-subjects/lights';
import { ToggleFish } from './scene-subjects/toggleFish';
import { Ground } from './scene-subjects/ground';

// DEBUG: declare scene and THREE on the Window interface for use by Three.js Inspector
declare global {
  interface Window {
    scene: any;
    THREE: any;
  }
}

@Component({
  selector: 'webgl-scene',
  templateUrl: './webgl-scene.component.html',
  styleUrls: ['./webgl-scene.component.css']
})
export class WebglSceneComponent implements AfterViewInit {
  /* HELPER PROPERTIES (PRIVATE PROPERTIES) */
  private camera: THREE.PerspectiveCamera;

  private get canvas() : HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  @ViewChild('canvas')
  private canvasRef: ElementRef;

  private renderer: THREE.WebGLRenderer;

  private scene: THREE.Scene;

  private sceneSubjects: any;

  private clock: THREE.Clock = new THREE.Clock();

  private window: Window;

  private raycaster: THREE.Raycaster;

  private mouse: THREE.Vector2 = new THREE.Vector2();

  private togglefish: any;

  private mouseDownPos = { x:0, y:0 };

  private isMouseDown: boolean = false;

  private orbitDelaySecs: number = 30;

  private timeMouseUp: number = 0;

  private isCameraOrbiting: boolean = false;

  private finishedFollowingDelaySecs: number = 1;

  private isFishFollowing: boolean = false;

  private initialCameraPos: THREE.Vector3 = new THREE.Vector3(0, 100, 500);

  /* STAGE PROPERTIES */
  @Input()
  public fieldOfView: number = 70;

  @Input('nearClipping')
  public nearClippingPlane: number = 1;

  @Input('farClipping')
  public farClippingPlane: number = 2000;



  /* DEPENDENCY INJECTION (CONSTRUCTOR) */
  constructor(@Inject('Window') window: Window, private alertService: AlertService) {
    this.window = window;
    this.alertService = alertService;
  }

  /* STAGING, ANIMATION, AND RENDERING */

  private createSceneSubjects() {
    this.togglefish = new ToggleFish(this.scene, this.alertService);
    this.sceneSubjects = [
      new Lights(this.scene),
      this.togglefish,
      new Ground(this.scene)
    ];
  }

  /**
   * Create the scene
   */
  private createScene() {
    /* Scene */
    this.scene = new THREE.Scene();

    // DEBUG: Expose scene and THREE as global variables for debugging in Three.js Inspector
    window.scene = this.scene;
    window.THREE = THREE;

    /* Camera */
    let aspectRatio = this.getAspectRatio();
    this.camera = new THREE.PerspectiveCamera(
      this.fieldOfView,
      aspectRatio,
      this.nearClippingPlane,
      this.farClippingPlane
    );
    this.camera.position.x = this.initialCameraPos.x;
    this.camera.position.y = this.initialCameraPos.y;
    this.camera.position.z = this.initialCameraPos.z;
    // this.camera.rotation.x = -0.3;

    /* Raycaster */
    this.raycaster = new THREE.Raycaster();

    /* Add event listeners */
    this.window.addEventListener("resize", this.onResize.bind(this), false);
    this.window.addEventListener("orientationchange", this.onOrientationChange.bind(this), false);

    document.addEventListener("touchstart", this.touch2Mouse, true);
    document.addEventListener("touchmove", this.touch2Mouse, true);
    document.addEventListener("touchend", this.touch2Mouse, true);

    document.addEventListener( 'mousedown', this.onDocumentMouseDown.bind(this), false );
    document.addEventListener( 'mousemove', this.onDocumentMouseMove.bind(this), false );
    document.addEventListener( 'mouseup', this.onDocumentMouseUp.bind(this), false );
  }

  public touch2Mouse(e) {
    let theTouch = e.changedTouches[0];
    let mouseEv;

    switch(e.type) {
      case "touchstart": mouseEv="mousedown"; break;
      case "touchend":   mouseEv="mouseup"; break;
      case "touchmove":  mouseEv="mousemove"; break;
      default: return;
    }

    var mouseEvent = document.createEvent("MouseEvent");
    mouseEvent.initMouseEvent(mouseEv, true, true, window, 1, theTouch.screenX, theTouch.screenY, theTouch.clientX, theTouch.clientY, false, false, false, false, 0, null);

    theTouch.target.dispatchEvent(mouseEvent);
    e.preventDefault();
  }

  private getAspectRatio() {
    return this.window.innerWidth / this.window.innerHeight;
  }

  /**
   * Start the rendering loop
   */
  private startRenderingLoop() {
    /* Renderer */
    // Use canvas element in template
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.window.innerWidth, this.window.innerHeight);
    this.renderer.setClearColor (0xc6f6ff, 1);

    // Enable shadow rendering
    this.renderer.shadowMap.enabled = true;

    let component: WebglSceneComponent = this;
    (function render() {
      requestAnimationFrame(render);

      // Update scene objects
      for(let i=0; i<component.sceneSubjects.length; i++) {
        component.sceneSubjects[i].update(component.clock.getElapsedTime(), component.mouseDownPos);
      }

      // Decide if camera should be orbiting
      if (component.isMouseDown) {
        component.isCameraOrbiting = false;
        component.isFishFollowing = true;
      } else {
        // Camera is orbiting when no mouse/touch events for 30 seconds
        component.isCameraOrbiting = (component.clock.getElapsedTime() - component.timeMouseUp) > component.orbitDelaySecs;
        // Fish has finished following when no mouse/touch events for 1 second
        component.isFishFollowing = (component.clock.getElapsedTime() - component.timeMouseUp) < component.finishedFollowingDelaySecs;
      }

      if (component.isCameraOrbiting) {
        // Update camera position to orbit around the origin
        let rotSpeed = 0.005;
        let x = component.camera.position.x;
        let z = component.camera.position.z;
        component.camera.position.x = x * Math.cos(rotSpeed) + z * Math.sin(rotSpeed);
        component.camera.position.z = z * Math.cos(rotSpeed) - x * Math.sin(rotSpeed);
        component.camera.lookAt(new THREE.Vector3(0, 0, 0));
      } else {
        // Update camera to move towards its original position
        let x = component.camera.position.x;
        let z = component.camera.position.z;
        let targetX = component.initialCameraPos.x;
        let targetZ = component.initialCameraPos.z;

        component.camera.position.x += (targetX - x) * 0.1;
        component.camera.position.z += (targetZ - z) * 0.1;
        component.camera.lookAt(new THREE.Vector3(0, 0, 0));
      }

      if (!component.isFishFollowing) {
        component.mouseDownPos = { x:0, y:0 };
      }

      // Render
      component.renderer.render(component.scene, component.camera);
    }());
  }

  /* EVENTS */

  /**
   * Update scene after resizing.
   */
  public onOrientationChange() {
    window.setTimeout(this.onResize.bind(this), 300);
  }

  public onResize() {
    // this.alertService.info(`onResize: ${window.innerWidth} x ${window.innerHeight}`);

    this.camera.aspect = this.getAspectRatio();
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld(true);

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.updateFarPlaneVertices();
  }

  public updateFarPlaneVertices() {

    // Far Plane dimensions
    let farPlane = (this.camera.far / 4); // Note: Actually using 1/4 of the camera frustum far plane
    let height = 2 * Math.tan(this.camera.fov / 2) * farPlane;
    let width = height * this.camera.aspect;

    let topRight = new THREE.Vector3( width / 2, height / 2, -this.camera.near );
    topRight.applyMatrix4( this.camera.matrixWorld );

    let bottomLeft = new THREE.Vector3( -width / 2, -height / 2, -this.camera.near );
    bottomLeft.applyMatrix4( this.camera.matrixWorld );

    let farPlaneVertices: THREE.Box2 = new THREE.Box2(new THREE.Vector2(bottomLeft.x, bottomLeft.y), new THREE.Vector2(topRight.x, topRight.y));

    this.togglefish.setFarPlaneVertices(farPlaneVertices);
  }

  public onDocumentMouseDown( event ) {
    event.preventDefault();

    this.mouse.x = ( event.clientX / this.renderer.domElement.clientWidth ) * 2 - 1;
    this.mouse.y = - ( event.clientY / this.renderer.domElement.clientHeight ) * 2 + 1;

    this.raycaster.setFromCamera( this.mouse, this.camera );

    let intersects = this.raycaster.intersectObjects( this.scene.children, true );

    if ( intersects.length > 0 && intersects[ 0 ].object.name.startsWith('togglefish_toggle')) {
      this.togglefish.toggle();
    } else {
      this.isMouseDown = true;
    }
  }

  public onDocumentMouseUp( event ) {
    event.preventDefault();

    this.isMouseDown = false;
    this.timeMouseUp = this.clock.getElapsedTime();
  }

  public onDocumentMouseMove(event) {
    event.preventDefault();

    if (this.isMouseDown) {
      // Update the mouse position when the mouse is down
      // Convert the mouse position to a normalized value between -1 and 1
      let tx = -1 + (event.clientX / this.renderer.domElement.clientWidth) * 2;
      let ty = 1 - (event.clientY / this.renderer.domElement.clientHeight) * 2;
      this.mouseDownPos = { x:tx, y:ty };
    }
  }

  /* LIFECYCLE */

  /**
   * We need to wait until template is bound to DOM, as we need the view
   * dimensions to create the scene. We could create the cube in a Init hook,
   * but we would be unable to add it to the scene until now.
   */
  public ngAfterViewInit() {
    this.createScene();
    this.createSceneSubjects();
    this.updateFarPlaneVertices();
    this.startRenderingLoop();
  }
}
