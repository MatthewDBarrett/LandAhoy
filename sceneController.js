import { Ship } from '../ship.js';
import { GetShip } from '../ship.js';

var scene = new THREE.Scene();

const clock = new THREE.Clock();

var Pos = new THREE.Vector3(0,0,0);
var Dir = new THREE.Vector3(0,0,0);

//var isMouseDown = false;

var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.z = 10;

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var spaceShip = new Ship(Pos, Dir);
scene.add( GetShip() );

var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;

var keyLight = new THREE.DirectionalLight(new THREE.Color('hsl(30, 100%, 75%)'), 1.0);
keyLight.position.set(0, 0, 0);

var fillLight = new THREE.DirectionalLight(new THREE.Color('hsl(240, 100%, 75%)'), 0.75);
fillLight.position.set(0, 0, 0);

var backLight = new THREE.DirectionalLight(0xffffff, 1.0);
backLight.position.set(0, 0, 0).normalize();

// var camLight = new THREE.PointLight(new THREE.Color(1,1,1), 1000, 2000);
// camLight.position.set(10,10,0);
// camera.add(camLight);
// scene.add(camera);

var pointLight = new THREE.SpotLight(new THREE.Color(1,1,1), 1,100);
pointLight.position.set(0,20,0);
scene.add(pointLight);

scene.add(keyLight);
scene.add(fillLight);
scene.add(backLight);

var geometry = new THREE.BoxGeometry( 1, 1, 1 );
var material = new THREE.MeshBasicMaterial( {color: 0x777777} );
var cube = new THREE.Mesh( geometry, material );

cube.position.set(0,-5,0);
cube.scale.set(100,0.1,100);

scene.add( cube );



var animate = function () {
	requestAnimationFrame( animate );
  // if ( isMouseDown ) {
	//    controls.update();
  //  }
  UpdateShip();
	renderer.render(scene, camera);
};

function UpdateShip(){
  var ship = GetShip();
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
