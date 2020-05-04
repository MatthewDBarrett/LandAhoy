import { getShipPos } from '../ship.js';
import { GetShip } from '../ship.js';

var isInitialized = false;
var offset;
var shipPos;
var camera;
var orbitCam = true;


export function cameraTracking() {   //constructor
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
  camera.position.z = 10;

  shipPos = getShipPos();
  offset = new THREE.Vector3(shipPos.x, shipPos.y + 4, shipPos.z - 8);
  camera.position.set(offset.x, offset.y, offset.z);
  
  isInitialized = true;
}

function animate() {   //Loop
  if(isInitialized){
    updateOffset();
    // camera.position.set(offset.x, offset.y, offset.z);
    // camera.lookAt(shipPos.x , shipPos.y, shipPos.z); 
    if(orbitCam){
      GetShip().add(getCamera());  
    } 
    else{
      GetShip().remove(getCamera());
    }
  }
  requestAnimationFrame( animate );
}

function updateOffset(){
  shipPos = getShipPos();
  offset = new THREE.Vector3(shipPos.x , shipPos.y + 4, shipPos.z - 8);
}

export function getCamera(){
  if(isInitialized){
    return camera;
  }
  else{
    return null;
  }
}

var onKeyDown = function ( event ) {

  switch ( event.keyCode ) {

    case 70: // f
      orbitCam = !orbitCam;
      console.log(orbitCam);
      break;
  }

};

document.addEventListener( 'keydown', onKeyDown, false );


animate();