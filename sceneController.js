import { Ship, GetShip } from '../ship.js';
import { cameraTracking } from '../cameraTracking.js';
import { getCamera } from '../cameraTracking.js';
import { ParticleGen } from '../particleGeneration.js';

var scene = new THREE.Scene();

const clock = new THREE.Clock();

var Pos = new THREE.Vector3(0,0,0);
var Dir = new THREE.Vector3(0,0,0);

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild( renderer.domElement );

//var isMouseDown = false;

//SOME PARTICLE MESHES, You need to supply a geometry and a material.
var particleMeshes = [];
var geometry = new THREE.Geometry();
var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );// {color: 0x00ff00}

var v1 = new THREE.Vector3(0,0,0);
var v2 = new THREE.Vector3(1,0,0);
var v3 = new THREE.Vector3(1,1,0);
geometry.vertices.push(v1);
geometry.vertices.push(v2);
geometry.vertices.push(v3);
geometry.faces.push( new THREE.Face3(0, 1, 2) );   
geometry.computeFaceNormals();
material.side = THREE.DoubleSide;
material.transparent = true;
material.wireframe = false;
geometry.translate( -0.5, -0.5, 0 );

particleMeshes.push([geometry, material]);

material = new THREE.MeshBasicMaterial({color: 0x00ff00});
material.side = THREE.DoubleSide;
material.transparent = true;
material.wireframe = false;
geometry = new THREE.BoxGeometry( 0.5, 0.5, 0.5 );
particleMeshes.push([geometry, material]);

var spaceShip = new Ship(Pos, Dir);
var camera = new cameraTracking(renderer, scene);
//pos, dir, maxParticles, maxLifetime, maxSpeed, scene, autoGen, meshes
var particleGen = new ParticleGen( new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), 5, 5, 0.1, scene, true, particleMeshes );
scene.add( GetShip() );


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

var groundTexture = new THREE.TextureLoader().load( "textures/grass.jpg" );
groundTexture.wrapS = THREE.RepeatWrapping;
groundTexture.wrapT = THREE.RepeatWrapping;
groundTexture.repeat.x = 20;
groundTexture.repeat.y = 20;

var geometry = new THREE.PlaneGeometry( 1, 1, 1 );
var material = new THREE.MeshPhongMaterial( {map: groundTexture } );
var ground = new THREE.Mesh( geometry, material );

ground.position.set(0,-5,0);
ground.scale.set(400,400,1);
ground.rotation.x = -Math.PI/2;

ground.castShadow = false;
ground.receiveShadow = true;

scene.add( ground );

var animate = function () {
	requestAnimationFrame( animate );
  // if ( isMouseDown ) {
	//    controls.update();
  //  }
  particleGen.autoLoop();

  UpdateShip();
	renderer.render(scene, getCamera());
};

function UpdateShip(){
  var ship = GetShip();

	ship.castShadow = true;
	ship.receiveShadow = true;

	var direction = new THREE.Vector3();

	ship.getWorldDirection( direction );
	
	//camera.position.set(ship.position.x, ship.position.y + 4, ship.position.z - 8);


	//camera.lookAt(ship.position);
  scene.add( ship );
}

animate();
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
