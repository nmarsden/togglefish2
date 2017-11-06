import { AfterViewInit, Component, ElementRef, Input, ViewChild, Inject } from '@angular/core';
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

  private mousePos = { x:0, y:0 };

  private isMouseDown: boolean = false;


  /* STAGE PROPERTIES */
  @Input()
  public cameraZ: number = 500;

  @Input()
  public fieldOfView: number = 70;

  @Input('nearClipping')
  public nearClippingPane: number = 1;

  @Input('farClipping')
  public farClippingPane: number = 1000;



  /* DEPENDENCY INJECTION (CONSTRUCTOR) */
  constructor(@Inject('Window') window: Window) {
    this.window = window;
  }

  /* STAGING, ANIMATION, AND RENDERING */

  private createSceneSubjects() {
    this.togglefish = new ToggleFish(this.scene);
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
      this.nearClippingPane,
      this.farClippingPane
    );
    this.camera.position.y = 100;
    this.camera.position.z = this.cameraZ;
    this.camera.rotation.x = -0.3;

    /* Raycaster */
    this.raycaster = new THREE.Raycaster();

    /* Add event listeners */
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
        component.sceneSubjects[i].update(component.clock.getElapsedTime(), component.mousePos);
      }

      component.renderer.render(component.scene, component.camera);
    }());
  }

  /* EVENTS */

  /**
   * Update scene after resizing.
   */
  public onResize(event) {
    this.camera.aspect = this.getAspectRatio();
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(event.target.innerWidth, event.target.innerHeight);
  }

  public onDocumentMouseDown( event ) {
    event.preventDefault();

    this.mouse.x = ( event.clientX / this.renderer.domElement.clientWidth ) * 2 - 1;
    this.mouse.y = - ( event.clientY / this.renderer.domElement.clientHeight ) * 2 + 1;

    this.raycaster.setFromCamera( this.mouse, this.camera );

    let intersects = this.raycaster.intersectObjects( this.scene.children, true );

    if ( intersects.length > 0 && intersects[ 0 ].object.name === 'toggle' ) {
      this.togglefish.toggle();
    } else {
      this.isMouseDown = true;
    }
  }

  public onDocumentMouseUp( event ) {
    event.preventDefault();

    this.isMouseDown = false;
  }

  public onDocumentMouseMove(event) {
    event.preventDefault();

    if (this.isMouseDown) {
      // Update the mouse position when the mouse is down
      // Convert the mouse position to a normalized value between -1 and 1
      let tx = -1 + (event.clientX / this.renderer.domElement.clientWidth) * 2;
      let ty = 1 - (event.clientY / this.renderer.domElement.clientHeight) * 2;
      this.mousePos = { x:tx, y:ty };
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
    this.startRenderingLoop();
  }
}
