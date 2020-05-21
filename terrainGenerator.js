import { addToScene } from '../sceneController.js'
import { removeFromScene } from '../sceneController.js'

var chunks = [];

var vertices = [];

var spheres = [];

var triangles = [];

var lastVertDis = 0;
var lastXSize = 0;
var lastZSize = 0;

var options = {
  vertDistance: 1,
  xSize: 20,
  zSize: 20,
  amplitude: 1
}

export function terrainGenerator(){
  init();
}

function init(){
  UserInterface();
  CreateWorld();
  //DrawSpheres();
}

function UserInterface(){
  var gui = new dat.GUI();
  var ter = gui.addFolder('Terrain');
  ter.add(options, 'vertDistance', 0, 10).name('Terrain Size').listen();
  ter.add(options, 'xSize', 0, 20).name('Width').listen();
  ter.add(options, 'zSize', 0, 20).name('Length').listen();
  ter.add(options, 'amplitude', 0, 10).name('Amplitude').listen();
  ter.open();
}

function CreateWorld(){
  CreateShape();
  CreateShape('up');
  CreateShape('left');
}

function CreateShape(direction){

  if (direction == 'up'){
    var i = 0;
    for (var z = 0; z <= options.zSize; z++){
      for (var x = 0; x <= options.xSize; x++){
        var yNoise = Math.random() * options.amplitude;
        if ( z == 0 ){
          vertices[i] = vertices[(options.zSize * options.zSize +options.zSize) + i];
        } else {
          vertices[i] = new THREE.Vector3(x * options.vertDistance, yNoise, (z * options.vertDistance) + (options.zSize * options.vertDistance));
        }
        i++;
      }
    }
  } else if (direction == 'left') {

  } else {
    var i = 0;
    for (var z = 0; z <= options.zSize; z++){
      for (var x = 0; x <= options.xSize; x++){
        var yNoise = Math.random() * options.amplitude;
        vertices[i] = new THREE.Vector3(x* options.vertDistance, yNoise, z* options.vertDistance);
        i++;
      }
    }
  }

  RenderChunk();
  chunks.push(triangles);

}

function RenderChunk(){
  for (var z = 0; z < (options.xSize * options.zSize); z+=options.xSize+1){
    for (var x = 0; x < options.xSize; x++){
      triangles[0] = vertices[z+x+0];
      triangles[1] = vertices[z+x+options.xSize+1];
      triangles[2] = vertices[z+x+options.xSize+2];
      DrawTriangle(triangles[0],triangles[1],triangles[2]);
      triangles[0] = vertices[z+x+1];
      triangles[1] = vertices[z+x+0];
      triangles[2] = vertices[z+x+options.xSize+2];
      DrawTriangle(triangles[0],triangles[1],triangles[2]);
    }
  }
}

function DrawTriangle(v1, v2, v3){
  var geom = new THREE.Geometry();

  geom.vertices.push(v1);
  geom.vertices.push(v2);
  geom.vertices.push(v3);

  geom.faces.push( new THREE.Face3( 0, 1, 2) );
  geom.computeFaceNormals();

  var mesh = new THREE.Mesh( geom, new THREE.MeshNormalMaterial() );

  addToScene(mesh);
}

function DrawSpheres(){
  var i = 0;
  if ( vertices != null) {
    for (var z = 0; z <= options.zSize; z++){
      for (var x = 0; x <= options.xSize; x++){
        var geometry = new THREE.SphereGeometry( 0.1, 32, 32 );
        var material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
        var sphere = new THREE.Mesh( geometry, material );

        sphere.position.set(x * options.vertDistance, 0, z * options.vertDistance);
        spheres[i] = sphere;
        addToScene( sphere );
        i++;
      }
    }
  }
}

function UpdateSpheres(){
  var i = 0;
  for (var z = 0; z <= options.zSize; z++){
    for (var x = 0; x <= options.xSize; x++){
      spheres[i].position.set(x * options.vertDistance, 0, z * options.vertDistance);
      i++;
      //addToScene( sphere );
    }
  }

  //removing uneeded spheres
  var totalSpheres = (options.xSize + 1) * (options.zSize + 1);
  var currentSpheres = spheres.length;
  for ( var i = currentSpheres; i > totalSpheres; i--){
    removeFromScene( spheres[i] );
    spheres.splice(i, 1);
  }
}

var animate = function() {
  requestAnimationFrame( animate );

  if(lastVertDis != 0 && options.vertDistance != lastVertDis){
    UpdateSpheres();
  }

  if(lastXSize != 0 && options.xSize != lastXSize){
    UpdateSpheres();
  }

  if(lastZSize != 0 && options.zSize != lastZSize){
    UpdateSpheres();
  }

  lastVertDis = options.vertDistance;
  lastXSize = options.xSize;
  lastZSize = options.zSize;
}

animate();
