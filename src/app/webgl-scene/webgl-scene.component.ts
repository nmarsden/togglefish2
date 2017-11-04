import { AfterViewInit, Component, ElementRef, Input, ViewChild, Inject } from '@angular/core';
import * as THREE from 'three';
import { Lights } from './scene-subjects/lights';
import { ToggleFish } from './scene-subjects/toggleFish';

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


  /* STAGE PROPERTIES */
  @Input()
  public cameraZ: number = 400;

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
      this.togglefish
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
    this.camera.position.z = this.cameraZ;

    /* Raycaster */
    this.raycaster = new THREE.Raycaster();

    /* Add event listeners */
    document.addEventListener( 'mousedown', this.onDocumentMouseDown.bind(this), false );
    document.addEventListener( 'touchstart', this.onDocumentTouchStart.bind(this), false );
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
    this.renderer.setClearColor (0x444499, 1);

    let component: WebglSceneComponent = this;
    (function render() {
      requestAnimationFrame(render);

      // Update scene objects
      for(let i=0; i<component.sceneSubjects.length; i++) {
        component.sceneSubjects[i].update(component.clock.getElapsedTime());
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

  public onDocumentTouchStart( event ) {
    event.preventDefault();

    event.clientX = event.touches[0].clientX;
    event.clientY = event.touches[0].clientY;
    this.onDocumentMouseDown( event );
  }

  public onDocumentMouseDown( event ) {
    event.preventDefault();

    this.mouse.x = ( event.clientX / this.renderer.domElement.clientWidth ) * 2 - 1;
    this.mouse.y = - ( event.clientY / this.renderer.domElement.clientHeight ) * 2 + 1;

    this.raycaster.setFromCamera( this.mouse, this.camera );

    let intersects = this.raycaster.intersectObjects( this.scene.children );

    if ( intersects.length > 0 && intersects[ 0 ].object.name === 'togglefish' ) {
      this.togglefish.toggle();
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
