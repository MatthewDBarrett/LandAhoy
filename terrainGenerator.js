import { addToScene } from '../sceneController.js'

var groundTexture;
var vertices = [];
var xSize = 20;
var zSize = 20;

var vertDistance = 3;

export function terrainGenerator(){
  init();
}

function init(){
  //DrawPlane();

  CreateShape();
  DrawSpheres();
}

function DrawPlane(){
  groundTexture = new THREE.TextureLoader().load( "textures/grass.jpg" );
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

  addToScene( ground );
}

function CreateShape(){
  //vertices = new THREE.Vector3[(xSize + 1) * (zSize + 1)];

  var i = 0;
  for (var z = 0; z <= zSize; z++){
    for (var x = 0; x <= xSize; x++){
      vertices[i] = new THREE.Vector3(x, 0, z);
      i++;
    }
  }

}

function UpdateMesh(){

}

function DrawSpheres(){
  if ( vertices != null ) {
    for (var z = 0; z <= zSize; z++){
      for (var x = 0; x <= xSize; x++){
        var geometry = new THREE.SphereGeometry( 0.1, 32, 32 );
        var material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
        var sphere = new THREE.Mesh( geometry, material );

        sphere.position.set(x * vertDistance, 0, z * vertDistance);
        addToScene( sphere );
      }
    }
  }
}
