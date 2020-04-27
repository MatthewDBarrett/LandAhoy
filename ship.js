const clock = new THREE.Clock();
var delta = clock.getDelta();

var Pos = new THREE.Vector3(0,0,0);
var Dir = new THREE.Vector3(0,0,0);

var ship = new THREE.Mesh();

var increaseSpeed=false;
var moveLeft=false;
var decreaseSpeed=false;
var moveRight=false;
var decreasePitch = false;
var increasePitch = false;

var speed = 0;
var minSpeed = 0;
var maxSpeed = 100;

var yaw = 0;
var minYaw = 0;
var maxYaw = 0;

var pitch = 0;
var minPitch = 0;
var maxPitch = 0;

var rollSpeed = 500;
var yawSpeed = 200;
var maxTilt = 0.5;
var returnSpeed = 0.5;
var pitchSpeed = 300;

var direction = new THREE.Vector3();

export function Ship(position, direction){
  this.Pos = position;
  this.Dir = direction;
  init();
}

function init(){
  CreateShip(
    '/textures/',     //texture file path
    'viper2.mtl',     //texture file name
    '/models/',       //model file path
    'viper2.obj'      //model file name
  );
}

function CreateShip(texturePath, textureFile, modelPath, modelFile){
  var mtlLoader = new THREE.MTLLoader();
  mtlLoader.setTexturePath( texturePath );
  mtlLoader.setPath( modelPath );
  mtlLoader.load( textureFile , function (materials) {    //load textures

  materials.preload();

  var objLoader = new THREE.OBJLoader();
  objLoader.setMaterials(materials);        //assign textures
  objLoader.load( modelPath.concat( modelFile ) , function (object) {

      ship = object;
      ship.castShadow = true;
    	ship.receiveShadow = true;
    });
  });
}

export function GetShip(){
  return ship;
}

function animate(){
  delta = clock.getDelta();

  requestAnimationFrame( animate );
  ShipControls();

  if ( speed > 0 ) {
    ship.getWorldDirection( direction );

    ship.position.add(direction.multiplyScalar(speed * delta));

    Pos = ship.position;
    Dir = ship.rotation;

    updateShip();
  }

  if ( !moveLeft && !moveRight && Dir.z != 0){
    if ( Dir.z < 0){
      Dir.z += returnSpeed * delta;
    } else if ( Dir.z > 0){
      Dir.z -= returnSpeed * delta;
    }
    if ( Dir.z > -0.009 && Dir.z < 0.009)
      Dir.z = 0;
  }

  if ( !decreasePitch && !increasePitch && Dir.x != 0){
    if ( Dir.x < 0){
      Dir.x += returnSpeed * delta;
    } else if ( Dir.x > 0){
      Dir.x -= returnSpeed * delta;
    }
    if ( Dir.x > -0.009 && Dir.x < 0.009)
      Dir.x = 0;
  }
}

function ShipControls(){
  var delta = clock.getDelta();

  if (moveLeft) {
    Dir.y += yawSpeed * delta;
    if ( Dir.z > -maxTilt)
      Dir.z -= rollSpeed/4 * delta;
  }
  if (moveRight) {
    Dir.y -= yawSpeed * delta;
    if ( Dir.z < maxTilt)
      Dir.z += rollSpeed/4 * delta;
  }
  if (increaseSpeed) {
    if ( speed < maxSpeed)
      speed++;
  }
  if (decreaseSpeed) {
    if ( speed > minSpeed)
      speed--;
  }
  if (increasePitch){
    if ( Dir.x > -maxTilt)
      Dir.x -= pitchSpeed * delta;
  }
  if (decreasePitch){
    if ( Dir.x < maxTilt)
      Dir.x += pitchSpeed * delta;
  }

  updateShip();

  //console.log(ship.position);

  // if (isMouseDown)
  //   controls.target = new THREE.Vector3(Pos.x,Pos.y,Pos.z);

  //camera.position.set(Pos.x+10,Pos.y+10,Pos.z+10);
  //camera.lookAt(ship);

}

function updateShip(){
  //ship.localToWorld( Pos );
  ship.position.set(Pos.x,Pos.y,Pos.z);
  ship.rotation.set(Dir.x,Dir.y,Dir.z);
}

export function getShipPos(){
  return Pos;
}

export function getShipDir(){
  return Dir;
}

var onKeyDown = function ( event ) {

  switch ( event.keyCode ) {

    case 87: // w
      decreasePitch = true;
      break;

    case 65: // a
      moveLeft = true;
      break;

    case 83: // s
      increasePitch = true;
      break;

    case 68: // d
      moveRight = true;
      break;
    case 81: // q
      decreaseSpeed = true;
      break;
    case 69: // e
      increaseSpeed = true;
      break;
  }

};

var onKeyUp = function ( event ) {

  switch( event.keyCode ) {

    case 87: // w
      decreasePitch = false;
      break;

    case 65: // a
      moveLeft = false;
      break;

    case 83: // s
      increasePitch = false;
      break;

    case 68: // d
      moveRight = false;
      break;
    case 81: // q
      decreaseSpeed = false;
      break;
    case 69: // e
      increaseSpeed = false;
      break;
  }
};

document.addEventListener( 'keydown', onKeyDown, false );
document.addEventListener( 'keyup', onKeyUp, false );
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

animate();
