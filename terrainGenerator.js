import { addToScene } from '../sceneController.js'
import { removeFromScene } from '../sceneController.js'

var chunk = [];
var chunks = [];
var chunkMap = [];

var vertices = [];

var spheres = [];

var triangle = [];
var numChunks = 0;

var lastVertDis = 0;
var lastXSize = 0;
var lastZSize = 0;

var startMapSize = 1;

var options = {
  vertDistance: 200,
  xSize: 20,
  zSize: 20,
  amplitude: 150,
  hide: ['None','Chunk 1','Chunk 2','Chunk 3'],
  show: ['None','Chunk 1','Chunk 2','Chunk 3']
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
  ter.add(options, 'hide', ['None','Chunk 1','Chunk 2','Chunk 3']).listen();
  ter.add(options, 'show', ['None','Chunk 1','Chunk 2','Chunk 3']).listen();
  ter.open();
}

function CreateWorld(){
  // CreateShape();
  // CreateShape('up');
  // CreateShape('left');

  //startMapSize *=3;

  for (var i = 0; i < startMapSize; i++){
    for (var j = 0; j < startMapSize; j++){
      var xPos = ( options.vertDistance * options.xSize ) * j;
      var zPos = ( options.vertDistance * options.zSize ) * i;
      // chunkMap[i] = [];
      // chunkMap[i][j] = 'X';

      chunkMap.push([i,j]);
      chunkMap[i][j] = 'x';

      CreateShape(xPos, zPos);
    }
  }

  PrintChunkMap();

}

function PrintChunkMap(){
  var text = "";
  for ( var a = 0; a < startMapSize; a++){
    for ( var b = 0; b < startMapSize; b++){
      text += chunkMap[a][b];
      text += "  ";
    }
    console.log(a + ': ' + text);
    text = '';
  }
}

function CreateShape(xPos, zPos){

  // if (direction == 'up'){
  //   var i = 0;
  //   for (var z = 0; z <= options.zSize; z++){
  //     for (var x = 0; x <= options.xSize; x++){
  //       var yNoise = Math.random() * options.amplitude;
  //       if ( z == 0 ){
  //         vertices[i] = vertices[(options.zSize * options.zSize + options.zSize) + i];
  //       } else {
  //         vertices[i] = new THREE.Vector3(x * options.vertDistance, yNoise, (z * options.vertDistance) + (options.zSize * options.vertDistance));
  //       }
  //       i++;
  //     }
  //   }
  // } else if (direction == 'left') {
  //   var i = 0;
  //   for (var z = 0; z <= options.zSize; z++){
  //     for (var x = 0; x <= options.xSize; x++){
  //       var yNoise = Math.random() * options.amplitude;
  //       if ( x == 0 ){
  //         vertices[i] = vertices[i+20];
  //       } else {
  //         vertices[i] = new THREE.Vector3((x * options.vertDistance) + (options.xSize * options.vertDistance), yNoise, (z * options.vertDistance) + (options.zSize * options.vertDistance));
  //       }
  //       i++;
  //     }
  //   }
  // } else {
    var i = 0;
    for (var z = 0; z <= options.zSize; z++){
      for (var x = 0; x <= options.xSize; x++){
        var yNoise = Math.random() * options.amplitude;



        vertices[i] = new THREE.Vector3(xPos + x* options.vertDistance, yNoise, zPos + z* options.vertDistance);
        i++;
      }
    }
  //}

  RenderChunk();
  chunks.push(chunk);
  chunk = [];
  //numChunks++;
}

function RenderChunk(){
  for (var z = 0; z < (options.xSize * options.zSize); z+=options.xSize+1){
    for (var x = 0; x < options.xSize; x++){
      triangle[0] = vertices[z+x+0];
      triangle[1] = vertices[z+x+options.xSize+1];
      triangle[2] = vertices[z+x+options.xSize+2];
      DrawTriangle(triangle[0],triangle[1],triangle[2]);
      triangle[0] = vertices[z+x+1];
      triangle[1] = vertices[z+x+0];
      triangle[2] = vertices[z+x+options.xSize+2];
      DrawTriangle(triangle[0],triangle[1],triangle[2]);
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

  chunk.push(mesh);
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

  if (options.hide != null && options.hide!= 'None'){
    if (options.hide == 'Chunk 1'){
      HideChunk(1);
      options.hide = 'None';
    } else if (options.hide == 'Chunk 2'){
      HideChunk(2);
      options.hide = 'None';
    } else if (options.hide == 'Chunk 3'){
      HideChunk(3);
      options.hide = 'None';
    }
  }

  if (options.show != null && options.show!= 'None'){
    if (options.show == 'Chunk 1'){
      ShowChunk(1);
      options.show = 'None';
    } else if (options.show == 'Chunk 2'){
      ShowChunk(2);
      options.show = 'None';
    } else if (options.show == 'Chunk 3'){
      ShowChunk(3);
      options.show = 'None';
    }
  }

}

function HideChunk(chunk){
  chunk--;
  var triArray = chunks[chunk];
  for (var i = 0; i < triArray.length; i++)
    triArray[i].visible = false;
}

function ShowChunk(chunk){
  chunk--;
  var triArray = chunks[chunk];
  for (var i = 0; i < triArray.length; i++)
    triArray[i].visible = true;
}

animate();
