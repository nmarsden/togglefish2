import {
  BufferGeometry, DoubleSide, EdgesGeometry, FlatShading, Group,
  LineBasicMaterial, LineSegments, Material, Mesh,
  MeshPhongMaterial, PlaneGeometry, Scene
} from "three";
import {AlertService} from "../../service/alert.service";

export function Water(scene: Scene, alertService: AlertService) {

  const IS_WIREFRAME = false;
  const COLOUR_WATER: number = 0xb5cde5;
  const COLOUR_EDGES: number = 0xc0eeee;
  const TOTAL_SIZE: number = 1800;
  const NUM_CELLS = 20;
  const WAVE_SIZE = 40;
  const OPACITY = 0.2;
  const EDGE_WIDTH = 2;
  const EDGE_OFFSET_Y = -EDGE_WIDTH;

  // Create water material & geometry
  let waterMaterial = new MeshPhongMaterial({
    color: COLOUR_WATER, transparent: true, opacity: OPACITY,
    wireframe: IS_WIREFRAME, shading: FlatShading, side: DoubleSide
  });
  let waterGeometry = new PlaneGeometry( TOTAL_SIZE, TOTAL_SIZE, NUM_CELLS, NUM_CELLS );
  waterGeometry.rotateX(Math.PI / 2);

  // Alter geometry's vertices y position to create waves
  let numVertices = waterGeometry.vertices.length;
  for (let i = 0; i < numVertices; i++) {
    waterGeometry.vertices[ i ].y = WAVE_SIZE * Math.sin( i / 2 );
  }
  // Create water mesh
  let water = new Mesh(waterGeometry as BufferGeometry, waterMaterial);
  water.name = 'water';
  water.position.y = 350;

  // Create water edges
  let edgesGeometry = new EdgesGeometry( (waterGeometry as BufferGeometry), 0 );
  let edgesMaterial = new LineBasicMaterial( { color: COLOUR_EDGES, linewidth: EDGE_WIDTH } );
  let edges = new LineSegments( edgesGeometry, edgesMaterial );
  edges.position.y = 350 + EDGE_OFFSET_Y;

  // Add water group to scene
  let waterGroup = new Group();
  scene.add( waterGroup );

  // Note: Workaround transparency rendering issues by rendering two instances of water with different colorWrite settings
  // 1st instance of water has colorWrite as false
  water.traverse( function( node ) {
    if (node instanceof Mesh) {
      node.renderOrder = 1;
      (node.material as Material).colorWrite = false;
    }
  });
  waterGroup.add(water);

  // 2nd instance of water has colorWrite as true
  let water2 = water.clone();
  water2.traverse( function( node ) {
    if (node instanceof Mesh) {
      node.renderOrder = 2;
      node.material = (node.material as Material).clone();
      (node.material as Material).colorWrite = true;
    }
  });
  waterGroup.add( water2 );

  // Add water edges to the water group
  waterGroup.add(edges);


  this.update = function(time, mousePos) {
    // Animate water vertices
    let numVertices = waterGeometry.vertices.length;
    for (let i = 0; i < numVertices; i++) {
      waterGeometry.vertices[ i ].y = WAVE_SIZE * Math.sin( i / 5 + ( (time * 10) + i ) / 7 );
    }
    waterGeometry.verticesNeedUpdate = true;
    waterGeometry.normalsNeedUpdate = true;

    // Update water edges
    edges.geometry = new EdgesGeometry( (waterGeometry as BufferGeometry), 0 );
    edges.position.y = 350 + EDGE_OFFSET_Y;
  };
}
