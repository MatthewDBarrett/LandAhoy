import { Ship, GetShip } from '../ship.js';
import { cameraTracking } from '../cameraTracking.js'
import { getCamera } from '../cameraTracking.js'
import { terrainGenerator } from '../terrainGenerator.js'
import { ParticleGen } from '../particleGeneration.js';

var scene = new THREE.Scene();
export function getScene(){
	return scene;
}

const clock = new THREE.Clock();

var Pos = new THREE.Vector3(0,0,0);
var Dir = new THREE.Vector3(0,0,0);

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild( renderer.domElement );

//var isMouseDown = false;



var spaceShip = new Ship(Pos, Dir);
var camera = new cameraTracking(renderer);
//pos, dir, maxParticles, maxLifetime, maxSpeed, scene, autoGen, meshes
scene.add( GetShip() );

//SKYBOX CODE

let materialArray = [];
// let texture_ft = new THREE.TextureLoader().load( '/textures/skybox_arid/arid2_ft.jpg');
// let texture_bk = new THREE.TextureLoader().load( '/textures/skybox_arid/arid2_bk.jpg');
// let texture_up = new THREE.TextureLoader().load( '/textures/skybox_arid/arid2_up.jpg');
// let texture_dn = new THREE.TextureLoader().load( '/textures/skybox_arid/arid2_dn.jpg');
// let texture_rt = new THREE.TextureLoader().load( '/textures/skybox_arid/arid2_rt.jpg');
// let texture_lf = new THREE.TextureLoader().load( '/textures/skybox_arid/arid2_lf.jpg');

let texture_ft = new THREE.TextureLoader().load( '/textures/skybox_divine/divine_ft.jpg');
let texture_bk = new THREE.TextureLoader().load( '/textures/skybox_divine/divine_bk.jpg');
let texture_up = new THREE.TextureLoader().load( '/textures/skybox_divine/divine_up.jpg');
let texture_dn = new THREE.TextureLoader().load( '/textures/skybox_divine/divine_dn.jpg');
let texture_rt = new THREE.TextureLoader().load( '/textures/skybox_divine/divine_rt.jpg');
let texture_lf = new THREE.TextureLoader().load( '/textures/skybox_divine/divine_lf.jpg');

materialArray.push(new THREE.MeshBasicMaterial( { map: texture_ft }));
materialArray.push(new THREE.MeshBasicMaterial( { map: texture_bk }));
materialArray.push(new THREE.MeshBasicMaterial( { map: texture_up }));
materialArray.push(new THREE.MeshBasicMaterial( { map: texture_dn }));
materialArray.push(new THREE.MeshBasicMaterial( { map: texture_rt }));
materialArray.push(new THREE.MeshBasicMaterial( { map: texture_lf }));

for (let i = 0; i < 6; i++)
  materialArray[i].side = THREE.BackSide;

let skyboxGeo = new THREE.BoxGeometry( 10000, 10000, 10000);
let skybox = new THREE.Mesh( skyboxGeo, materialArray );
scene.add( skybox );

//FOG CODE

// var fogColor = new THREE.Color(0xffffff);
// scene.background = fogColor;
// scene.fog = new THREE.Fog(fogColor, 0.0025, 10000);


// var keyLight = new THREE.DirectionalLight(new THREE.Color('hsl(30, 100%, 75%)'), 1.0);
// keyLight.position.set(0, 0, 0);
//
// var fillLight = new THREE.DirectionalLight(new THREE.Color('hsl(240, 100%, 75%)'), 0.75);
// fillLight.position.set(0, 0, 0);
//
// var backLight = new THREE.DirectionalLight(0xffffff, 1.0);
// backLight.position.set(0, 0, 0).normalize();
//
// scene.add(keyLight);
// scene.add(fillLight);
// scene.add(backLight);

// var camLight = new THREE.PointLight(new THREE.Color(1,1,1), 1000, 2000);
// camLight.position.set(10,10,0);
// camera.add(camLight);
// scene.add(camera);

// var spotLight = new THREE.SpotLight(
// 	new THREE.Color(1,1,1), 						//color
// 	2,																	//intensity
// 	200, 																//distance
// 	Math.PI/3, 													//angle
// 	0.9																	//penumbra
// );
// spotLight.position.set(0,80,0);
// spotLight.castShadow = true;
// scene.add(spotLight);
//
// var spotlightHelper = new THREE.SpotLightHelper(spotLight);
// scene.add(spotlightHelper);

var directionLight = new THREE.DirectionalLight(
	new THREE.Color(1,1,1), 						//color
	1,																	//intensity
	200, 																//distance
	Math.PI/3, 													//angle
	0.9																	//penumbra
);
directionLight.castShadow = true;
scene.add(directionLight);

var terrain = new terrainGenerator();

var animate = function () {
	requestAnimationFrame( animate );
  // if ( isMouseDown ) {
	//    controls.update();
  //  }

  UpdateShip();
	renderer.render(scene, getCamera());
};

function UpdateShip(){
  var ship = GetShip();
  	scene.updateMatrixWorld();
	ship.castShadow = true;
	ship.receiveShadow = true;

	var direction = new THREE.Vector3();

	ship.getWorldDirection( direction );

	//camera.position.set(ship.position.x, ship.position.y + 4, ship.position.z - 8);


	//camera.lookAt(ship.position);

	//console.log("ship position: " + ship.position.x + ", "+ ship.position.y + ", "+ ship.position.z);
	UpdateSkyPos(ship.position.x, ship.position.y, ship.position.z);
	//console.log("SKYBOX: " + skybox.position.x + ", "+ skybox.position.y + ", "+ skybox.position.z);

  scene.add( ship );
}

function UpdateSkyPos(x, y, z){
	skybox.position.set( x, y, z );
}

export function addToScene(object){
	scene.add( object );
}

export function removeFromScene(object){
	scene.remove( object );
}

animate();

//this fucntion is called when the window is resized
var MyResize = function ( )
{
  var width = window.innerWidth;
  var height = window.innerHeight;
  renderer.setSize(width,height);
  getCamera().aspect = width/height;
  getCamera().updateProjectionMatrix();
  renderer.render(scene,camera);
};

//link the resize of the window to the update of the camera
window.addEventListener( 'resize', MyResize);
// document.addEventListener( 'keydown', onKeyDown, false );
// document.addEventListener( 'keyup', onKeyUp, false );
// document.addEventListener( 'mousedown', onMouseDown, false );
// document.addEventListener( 'mouseup', onMouseUp, false );

// var canvas = renderer.domElement;
// document.body.appendChild(canvas);
//
// var plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -10);
// var raycaster = new THREE.Raycaster();
// var mouse = new THREE.Vector2();
// var pointOfIntersection = new THREE.Vector3();
// canvas.addEventListener("mousemove", onMouseMove, false);
//
// var raycaster = new THREE.Raycaster();
// var mouse = new THREE.Vector2();
// var pointOfIntersection = new THREE.Vector3();
// canvas.addEventListener("mousemove", onMouseMove, false);
//
// function onMouseMove(event){
//   if (!isMouseDown) {
//     mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
//       mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
//     raycaster.setFromCamera(mouse, camera);
//     raycaster.ray.intersectPlane(plane, pointOfIntersection);
//     ship.lookAt(pointOfIntersection);
//   }
// }
//
// function onMouseDown(event){
//   console.log("mouse down");
//   controls.enabled = true;
//
//   isMouseDown = true;
// }
//
// function onMouseUp(event){
//   console.log("mouse up");
//   isMouseDown = false;
//   controls.enabled = false;
// }
