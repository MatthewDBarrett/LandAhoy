import { getShipPos } from '../ship.js';
import { getShipDir } from '../ship.js';

var relativeCameraOffset = new THREE.Vector3(0,50,200);
var cameraOffset = new THREE.Vector3(0,5,-10);
var shipCube;
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.z = getShipPos().z - 10;

export function cameraTracking(scene, renderer) {   //constructor
  // cameraOffset = relativeCameraOffset.applyMatrix4(shipCube.matrixWorld);

  // camera.position.x = cameraOffset.x;
  // camera.position.y = cameraOffset.y;
  // camera.position.z = cameraOffset.z;
  // camera.lookAt(shipCube.position);
}

function animate() {   //Loop
  camera.position.x = cameraOffset.x;
  camera.position.y = cameraOffset.y;
  camera.position.z = cameraOffset.z;
  camera.lookAt(getShipPos());
  requestAnimationFrame( animate );
}

function resetControlTarget(){
  controls.target.set = getShipPos();
}

export function getCamera(){
  return camera;
}

animate();
