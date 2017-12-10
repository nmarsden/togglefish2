import {BoxGeometry, Group, Matrix4, Mesh, MeshPhongMaterial, PointLight, SphereGeometry} from "three";
import {AlertService} from "../../service/alert.service";

export function XMas(toggleFish, alertService: AlertService, ) {

  let isToggleOn: boolean = true;

  const COLOUR_NOSE: number = 0xFF0000;
  const COLOUR_ANTLERS: number = 0xFFDD00;
  const COLOUR_ANTLER_BAND: number = 0x663333;
  const IS_WIREFRAME: boolean = false;

  // Create and add Nose to togglefish
  let noseMaterial = new MeshPhongMaterial({ color: COLOUR_NOSE,  wireframe: IS_WIREFRAME });
  let noseMesh = new Mesh(new SphereGeometry(15, 8, 8), noseMaterial);
  noseMesh.name = `togglefish_nose`;
  noseMesh.castShadow = true;
  noseMesh.receiveShadow = true;
  noseMesh.position.y = 15;
  noseMesh.position.z = 130;
  toggleFish.add(noseMesh);

  // Create point light
  let pointLight = new PointLight(0xFFFFFF, 1);
  pointLight.position.set(0, 15, 170);
  pointLight.visible = !isToggleOn;
  toggleFish.add(pointLight);

  // Create and add antlers to togglefish
  let antlerMaterial = new MeshPhongMaterial({ color: COLOUR_ANTLERS, wireframe: IS_WIREFRAME });
  let antlerBandMaterial = new MeshPhongMaterial({ color: COLOUR_ANTLER_BAND, wireframe: IS_WIREFRAME });

  // -- Right Antler
  let antlerRightGroup = new Group();
  antlerRightGroup.name = 'togglefish_antlerRight';
  antlerRightGroup.position.x = -45;
  antlerRightGroup.position.y = 110;
  antlerRightGroup.position.z = 60;
  antlerRightGroup.rotateZ(Math.PI / 6);

  let antlerRightGeometry = new BoxGeometry(10, 80, 10);
  antlerRightGeometry.merge(new BoxGeometry(20, 10, 10), new Matrix4().makeTranslation(-10, 35, 0));
  antlerRightGeometry.merge(new BoxGeometry(20, 10, 10), new Matrix4().makeTranslation(-10, 15, 0));
  antlerRightGeometry.merge(new BoxGeometry(20, 10, 10), new Matrix4().makeTranslation(-10, -5, 0));
  let antlerRightMesh = new Mesh(antlerRightGeometry, antlerMaterial);
  antlerRightMesh.castShadow = true;
  antlerRightMesh.receiveShadow = true;
  antlerRightGroup.add(antlerRightMesh);

  toggleFish.add(antlerRightGroup);

  // -- Left Antler
  let antlerLeftGroup = new Group();
  antlerLeftGroup.name = 'togglefish_antlerLeft';
  antlerLeftGroup.position.x = 35;
  antlerLeftGroup.position.y = 120;
  antlerLeftGroup.position.z = 60;
  antlerLeftGroup.rotateY(Math.PI);
  let antlerLeftGeometry = antlerRightGeometry.clone();
  let antlerLeftMesh = new Mesh(antlerLeftGeometry, antlerMaterial);
  antlerLeftMesh.castShadow = true;
  antlerLeftMesh.receiveShadow = true;
  antlerLeftGroup.add(antlerLeftMesh);

  toggleFish.add(antlerLeftGroup);

  // -- Antler Band
  let antlerBandGroup = new Group();
  antlerBandGroup.name = 'togglefish_antlerBand';
  antlerBandGroup.position.x = 0;
  antlerBandGroup.position.y = 77.5;
  antlerBandGroup.position.z = 60;
  antlerBandGroup.rotateY(Math.PI);
  let antlerBandGeometry = new BoxGeometry(155, 5, 14);
  antlerBandGeometry.merge(new BoxGeometry(5, 75, 14), new Matrix4().makeTranslation(-75, -40, 0));
  antlerBandGeometry.merge(new BoxGeometry(5, 75, 14), new Matrix4().makeTranslation(75, -40, 0));
  let antlerBandMesh = new Mesh(antlerBandGeometry, antlerBandMaterial);
  antlerBandMesh.castShadow = true;
  antlerBandMesh.receiveShadow = true;
  antlerBandGroup.add(antlerBandMesh);

  toggleFish.add(antlerBandGroup);



  this.update = function(time, mouseDownPos) {
    pointLight.power = 4 * Math.PI * (1 + Math.sin(time)) * 0.5;
  };

  this.toggle = function() {
    isToggleOn = !isToggleOn;

    pointLight.visible = !isToggleOn;
  };


}
