import { Ship } from '../ship.js';
import { GetShip } from '../ship.js';
import { cameraTracking } from '../cameraTracking.js'
import { getCamera } from '../cameraTracking.js'

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

var spaceShip = new Ship(Pos, Dir);
var camera = new cameraTracking();
scene.add( GetShip() );

var controls = new THREE.OrbitControls(getCamera(), renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;

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
