import { ParticleGen } from '../particleGeneration.js';
import { getScene, loadFile } from '../sceneController.js';

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
var maxSpeed = 400;

var rollSpeed = 1000;
var yawSpeed = 350;
var maxTilt = 0.5;
var minTilt = -0.5;
var returnSpeed = 0.5;
var pitchSpeed = 300;

var direction = new THREE.Vector3();

var initialise = false;

var boosterParticleLeft;
var boosterParticleRight;
var boosterParticleUpper;
var isInitialised;

var fireVertShader = loadFile('./shaders/fireParticleVertShader.glsl');
var fireFragShader = loadFile('./shaders/fireParticleFragShader.glsl');
var uniforms = {
  opacity : {value : 0.2},
  color1 : {value : new THREE.Vector3()},
  color2 : {value : new THREE.Vector3()},
  colorlerp : {value : 0.0}
};

//SOME PARTICLE MESHES, You need to supply a geometry and a material.
  var particleMeshes = [];
  var geometry = new THREE.Geometry();
  var material = new THREE.ShaderMaterial();// {color: 0x00ff00}
  material.vertexShader = fireVertShader;
  material.fragmentShader = fireFragShader;
  material.uniforms = uniforms;
  material.side = THREE.DoubleSide;
  material.transparent = true;
  material.wireframe = false;

  //TRIANGLE PARTICLE
  var v1 = new THREE.Vector3(0,0,0);
  var v2 = new THREE.Vector3(1,0,0);
  var v3 = new THREE.Vector3(1,1,0);
  geometry.vertices.push(v1);
  geometry.vertices.push(v2);
  geometry.vertices.push(v3);
  geometry.faces.push( new THREE.Face3(0, 1, 2) );
  geometry.computeFaceNormals();
  geometry.translate( -0.5, -0.5, 0 );
  geometry.scale(0.4, 0.4, 0.4);
  particleMeshes.push([geometry, material, true]);

  //CUBE PARTICLE
  geometry = new THREE.BoxGeometry( 1, 1, 1 );
  geometry.scale(0.4, 0.4, 0.4);
  particleMeshes.push([geometry, material, true]);

  //CYLINDER PARTICLE
  geometry = new THREE.CylinderBufferGeometry(0.25, 0.25, 1, 10);
  geometry.scale(0.4, 0.4, 0.4);
  particleMeshes.push([geometry, material, true]);

  //ICOSAHEDRON PARTICLE
  geometry = new THREE.IcosahedronBufferGeometry(1, 0);
  geometry.scale(0.3, 0.3, 0.3);
  particleMeshes.push([geometry, material, true]);

  //NORMAL MESH
  geometry = new THREE.TorusKnotBufferGeometry(10, 3, 4, 16 );
  // material = new THREE.MeshNormalMaterial();
  // material.transparent = true;
  geometry.scale(0.01, 0.01, 0.01);
  particleMeshes.push([geometry, material, true]);
//END OF PARTICLE MESHES

//POSITIONING FOR PARITCLE GENERATORS
var pivotLeft = new THREE.Object3D();
var pivotRight = new THREE.Object3D();
var pivotUpper = new THREE.Object3D();
//END OF SECTION FOR POSITIONING

//Flashlight
var flashlight = new THREE.SpotLight( new THREE.Color(1,1,1), 0.4);
var flashlightTarget = new THREE.Object3D();
var isFlashlightActive = false;

//PointLights
var boosterUpperPointLight = new THREE.PointLight( 0x3e65c0,  5, 10, 2);
var boosterRightPointLight = new THREE.PointLight( 0x3e65c0, 5, 10, 2);
var boosterLeftPointLight = new THREE.PointLight( 0x3e65c0, 5, 10, 2);

var starboardLight = new THREE.PointLight( 0x00ff00, 100, 10, 2);
var portLight = new THREE.PointLight( 0xff0000, 100, 10, 2);

//Boost
// var boostActive = false;
// var maxBoostTime = 2;
// var boostUsed = 0;
// var cooldownProgress = 0;
// var cooldown = 1.5;
// var maxBoostSpeed = 700;
// var boostAllowed = true;
// var cooldownActive = false;

export function Ship(position, direction){
  this.Pos = position;
  this.Dir = direction;
  init();
  initialise = true;
}

function init(){
  CreateShip(
    '/textures/',     //texture file path
    'spaceShip.mtl',     //texture file name
    '/models/',       //model file path
    'spaceShip.obj'      //model file name
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

  ship.rotation.reorder = "YXZ";
  //Setting up particle generators.
  pivotLeft.position.set(ship.position.x + 3, ship.position.y - 0.1, ship.position.z - 3.6);
  pivotRight.position.set(ship.position.x - 3, ship.position.y - 0.1, ship.position.z - 3.6);
  pivotUpper.position.set(ship.position.x , ship.position.y + 0.85, ship.position.z - 4);
  flashlightTarget.position.set(ship.position.x, ship.position.y-5, ship.position.z + 10);
  flashlight.position.set(ship.position.x, ship.position.y-2, ship.position.z + 3);
  flashlight.decay = 2;
  flashlight.distance = 0;
  flashlight.penumbra = 1;
  flashlight.angle = 0.26;
  flashlight.castShadow = true;

  // var geometry1 = new THREE.SphereGeometry( 0.25, 32, 32 );
  // var material1 = new THREE.MeshBasicMaterial( {color: 0xff0000} );
  // var sphere1 = new THREE.Mesh( geometry1, material1 );
  // sphere1.position.set( ship.position.x + 3, ship.position.y - 0.1, ship.position.z - 4.8 );
  // getScene().add( sphere1 );

  //Pointlight
  boosterUpperPointLight.position.set( ship.position.x , ship.position.y + 0.85, ship.position.z - 4 );
  boosterLeftPointLight.position.set( ship.position.x + 3, ship.position.y - 0.1, ship.position.z - 4.5 );
  boosterRightPointLight.position.set( ship.position.x - 3, ship.position.y - 0.1, ship.position.z - 4.5 );

  starboardLight.position.set( ship.position.x - 4, ship.position.y - 0.1, ship.position.z - 4.5 );
  portLight.position.set( ship.position.x + 4, ship.position.y - 0.1, ship.position.z - 4.5 );

  //constructor(pos, dir, maxParticles, maxLifetime, maxSpeed, autoGen, meshes, isDeviate, isRotate)
  boosterParticleLeft = new ParticleGen( new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1), 50, 1, 0.1, true, particleMeshes, true, true );
  boosterParticleRight = new ParticleGen( new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1), 50, 1, 0.1, true, particleMeshes, true, true );
  boosterParticleUpper = new ParticleGen( new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1), 50, 1, 0.1, true, particleMeshes, true, true );
  isInitialised = true;
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

  // console.log("Boost Allowed: " + boostAllowed);
  // console.log("Boost Used: " + boostUsed);
  // console.log("Speed: " + speed );
  // console.log("cooldownProgress: " + cooldownProgress );
  // console.log("boost Active: " + boostActive);
  // console.log("maxBoostTime: " + maxBoostTime);
  // console.log("maxBoostSpeed: " + maxBoostSpeed)
  // console.log("cooldownActive: " + cooldownActive);

  // //Boost
  // if( boostActive || cooldownActive){
  //   if( (boostUsed < maxBoostTime) && boostAllowed){
  //     speed += 75;
  //     if(speed > maxBoostSpeed){
  //       speed = maxBoostSpeed;
  //     }
  //     boostUsed += delta;
  //     if(boostUsed >= maxBoostTime){
  //       boostUsed = maxBoostTime;
  //       boostAllowed = false;
  //       cooldownActive = true;
  //     }
  //   }
  //   if(!boostAllowed){
  //     //start cooldown
  //     cooldownProgress += delta;
  //     if(speed > maxSpeed){
  //       speed -= 100;
  //       if(speed < maxSpeed){
  //         speed = maxSpeed;
  //       }
  //     }
  //     if(cooldownProgress >= cooldown){
  //       boostUsed -= delta;
  //       if(boostUsed <= 0){
  //         boostUsed = 0;
  //         boostAllowed = true;
  //         cooldownActive = false;
  //       }
  //     }
  //   }
  //   else if( !boostActive ){
  //     if(speed > maxSpeed){
  //       speed -= 100;
  //       if(speed < maxSpeed){
  //         speed = maxSpeed;
  //       }
  //     }
  //   }
  // }

  if(isInitialised){
    ship.traverse(function(child){
      child.castShadow = true;
    });
    ship.add(pivotLeft);
    ship.add(pivotRight);
    ship.add(pivotUpper);
    ship.add(flashlightTarget);
    ship.add(flashlight);
    if(isFlashlightActive){
      flashlight.intensity = 0.4;
    }
    else{
      flashlight.intensity = 0;
    }
    ship.add(boosterUpperPointLight);
    ship.add(boosterRightPointLight);
    ship.add(boosterLeftPointLight);
    flashlight.target = flashlightTarget;

    if(speed < 5){
      boosterParticleLeft.setMaxParticles(10);
      boosterParticleRight.setMaxParticles(10);
      boosterParticleUpper.setMaxParticles(10);
    }
    else{
      boosterParticleLeft.setMaxParticles(speed * speed);
      boosterParticleRight.setMaxParticles(speed * speed);
      boosterParticleUpper.setMaxParticles(speed * speed);
    }

    if(speed < 10){
      boosterUpperPointLight.intensity = 1;
      boosterRightPointLight.intensity = 1;
      boosterLeftPointLight.intensity = 1;
    }
    else if(speed < 100){
      boosterUpperPointLight.intensity = speed/20;
      boosterRightPointLight.intensity = speed/20;
      boosterLeftPointLight.intensity = speed/20;
    }
    else if(speed > 100){
      boosterUpperPointLight.intensity = 7;
      boosterRightPointLight.intensity = 7;
      boosterLeftPointLight.intensity = 7;
    }
    else if(speed > 500){
      boosterUpperPointLight.intensity = 10;
      boosterRightPointLight.intensity = 10;
      boosterLeftPointLight.intensity = 10;
    }

    //Setting Position
    var posVec1 = new THREE.Vector3();
    var posVec2 = new THREE.Vector3();
    var posVec3 = new THREE.Vector3();
    ship.updateMatrixWorld();
    posVec1.setFromMatrixPosition( pivotLeft.matrixWorld );
    boosterParticleLeft.setPos(posVec1);
    posVec2.setFromMatrixPosition( pivotRight.matrixWorld );
    boosterParticleRight.setPos(posVec2);
    posVec3.setFromMatrixPosition( pivotUpper.matrixWorld );
    boosterParticleUpper.setPos(posVec3);

    //FOR SOME REASON YOU ONLY HAVE TO ADD PI TO THE X AXIS REEEEEEEEEEEEEE//Setting Direction
    var dir = new THREE.Vector3(ship.rotation.x + Math.PI, ship.rotation.y, ship.rotation.z);
    boosterParticleLeft.setDir(dir.clone());
    boosterParticleRight.setDir(dir.clone());
    boosterParticleUpper.setDir(dir.clone());

    //Update Particle generators
    boosterParticleLeft.autoLoop();
    boosterParticleRight.autoLoop();
    boosterParticleUpper.autoLoop();
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

export function getShipPos(){
  return Pos;
}

export function getShipDir(){
  return Dir;
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
    if ( Dir.x > minTilt){
      // ship.rotation.x -= pitchSpeed * delta;
      Dir.x -= pitchSpeed * delta;
    }
  }
  if (decreasePitch){
    if ( Dir.x < maxTilt){
      Dir.x += pitchSpeed * delta;
    }
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
  ship.rotation.set(Dir.x,Dir.y,Dir.z, 'YXZ');
}

var onKeyDown = function ( event ) {

  switch ( event.keyCode ) {
    // case 32: //space
    //   boostActive = true;
    //   break;
    case 49: //1
      isFlashlightActive = !isFlashlightActive;
      break;
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
    // case 32: //space
    //   boostActive = false;
    //   break;
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
