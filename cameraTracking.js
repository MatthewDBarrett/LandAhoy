import { getShipPos } from '../ship.js';
import { getShipDir } from '../ship.js';
import { GetShip } from '../ship.js';

//Initialised variable
var isInitialized = false;
var offset;
var shipPos;
var shipDir;
var camera;

//Orbit controls
var orbitCam = true;
var controls;

//Clone of ship as a cube. Invisible by default.
var cubeA;
var cubeB;
var geometry;
var material;

//Groups the cube and the camera so rotation and position is locked
var group;

//Other variables
var scene;


export function cameraTracking(renderer, threeJSscene) {   //constructor
  //save scene
  scene = threeJSscene; 
  
  //Initialise Camera.
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
  camera.position.z = 10;

  //Initialise Controls for OrbitControls and initial camera offset position.
  shipPos = getShipPos();
  shipDir = getShipDir();
  offset = new THREE.Vector3(shipPos.x, shipPos.y + 4, shipPos.z - 8);
  camera.position.set(offset.x, offset.y, offset.z);
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  controls.enableZoom = true;

  //Cube Instatiation
  geometry = new THREE.BoxGeometry( 1, 1, 1 );
  material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
  cubeA = new THREE.Mesh( geometry, material );
  cubeA.position.set(shipPos.x, shipPos.y, shipPos.z);
  cubeA.rotation.set(shipDir.x, shipDir.y, shipDir.z);
  cubeB = new THREE.Mesh( geometry, material );
  cubeB.position.set(camera.position.x, camera.position.y, camera.position.z);
  cubeB.rotation.set(cubeA.position.x, cubeA.position.y, cubeA.position.z);
  cubeA.visible = false;
  cubeB.visible = false;

  //create group, add cubes and add to scene
  group = new THREE.Group();
  group.add( cubeA );
  group.add( cubeB );
  scene.add( group );
  
  //Set Initialise flag to true to finish up.
  isInitialized = true;
}

function animate() {   //Loop
  if(isInitialized){

    //Check if orbit cam should be used.
    if(orbitCam){
      GetShip().add(getCamera());
      controls.enabled = true;
    } 
    else{
      //Remove the camera from the ship, add it to the cube.
      GetShip().remove(getCamera());
      
      //remove control from orbit, and update the offset.
      updateOffset();
      
      //Extract world position from cubeB and cubeA
      scene.updateMatrixWorld();
      group.updateMatrixWorld();
      var posVec = new THREE.Vector3();
      posVec.setFromMatrixPosition(cubeB.matrixWorld );
      var dirVec = new THREE.Vector3();
      dirVec.setFromMatrixPosition(cubeA.matrixWorld );

      //Set camera position
      camera.position.set(posVec.x, posVec.y, posVec.z);
      camera.lookAt(dirVec.x, dirVec.y, dirVec.z);
      controls.enabled = false;
    }
  }
  requestAnimationFrame( animate );
}

function updateOffset(){
  //Update the group object for A and B to move together seamlessly
  shipPos = getShipPos();
  shipDir = getShipDir();
  group.position.set(shipPos.x, shipPos.y, shipPos.z);
  group.rotation.set(shipDir.x, shipDir.y, shipDir.z, "YXZ");
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