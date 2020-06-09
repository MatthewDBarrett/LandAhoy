import { addToScene } from '../sceneController.js'
import { removeFromScene } from '../sceneController.js'

var chunk = [];
var chunks = [];
var chunkMap = [];

var vertices = [];
var verticesMap = [];

var curZIndex = 0;
var curXIndex = 0;

var spheres = [];

var triangle = [];
var numChunks = 0;

var lastVertDis = 0;
var lastXSize = 0;
var lastZSize = 0;

var startMapSize = 2;

var options = {
  vertDistance: 1,
  xSize: 20,
  zSize: 20,
  amplitude: 1,
  hide: ['None','Chunk 1','Chunk 2','Chunk 3'],
  show: ['None','Chunk 1','Chunk 2','Chunk 3']
}

export function terrainGenerator(){
  init();
}

function init(){
  UserInterface();
  CreateWorld();
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

  for (var z = 0; z < startMapSize; z++){                                 //creating chunks, each interation is another chunk generated
    for (var x = 0; x < startMapSize; x++){
      var zPos = ( options.vertDistance * ( options.zSize ) ) * z;
      var xPos = ( options.vertDistance * ( options.xSize ) ) * x;
      curZIndex = z;
      curXIndex = x;

      //console.log('-- z: ' + z + ' x: ' + x);
      CreateShape(xPos, zPos);
      chunkMap.push([z,x]);
      chunkMap[z][x] = chunk;
      // verticesMap.push([z,x]);
      // verticesMap[z][x] = vertices;
    }
  }
}

function PrintChunkMap(){
  var text = "";
  console.log("CHUNK MAP:");
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
  //vertices = [];
  var connectAbove = CheckConnection('above');
  //console.log("Above: " + ( connectAbove ? "true" : "false") );
  var connectBelow = CheckConnection('below');
  //console.log("Below: " + ( connectBelow ? "true" : "false") );
  var connectRight = CheckConnection('right');
  //console.log("Right: " + ( connectRight ? "true" : "false") );
  var connectLeft = CheckConnection('left');
  //console.log("Left: " + ( connectLeft ? " true" : " false") );

  for (var z = 0; z <= options.zSize; z++){
    for (var x = 0; x <= options.xSize; x++){
      var yNoise = Math.random() * options.amplitude;

      if ( connectAbove && z == options.zSize -1){

      }

      if ( connectBelow && z == 0){
        var vertMap = verticesMap[curZIndex - 1][curXIndex];
        yNoise = vertMap[vertMap.length - options.zSize + (i-1)].y;
      }

      if ( connectRight && x == 0){
        var vertMap = verticesMap[curZIndex][curXIndex - 1];
        yNoise = vertMap[(i) + options.xSize].y;
      }

      if ( connectLeft && x == options.xSize-1) {

      }

      vertices.push( new THREE.Vector3(xPos + x * options.vertDistance, yNoise, zPos + z * options.vertDistance) );

      i++;
    }
  }
  //}

  RenderChunk();
  //console.log("chunk: " + chunkMap[0][0][0][0]);
  //chunk = [];
  //numChunks++;
}

function CheckConnection(side){

  //console.log( "chunkMap length: " + chunkMap.length );
  if ( chunkMap.length > 0){
    switch( side ){
      case 'above':
        if ( curZIndex >= chunkMap.length )
          if ( chunkMap[curZIndex + 1][curXIndex] != 0 && chunkMap[curZIndex + 1][curXIndex] != null )
            return true;
        break;

      case 'below':
        if ( curZIndex != 0 )
          if ( chunkMap[curZIndex - 1][curXIndex] != 0 && chunkMap[curZIndex - 1][curXIndex] != null )
            return true;
        break;

      case 'right':
        if ( chunkMap[curZIndex][curXIndex - 1] != 0 && chunkMap[curZIndex][curXIndex - 1] != null )
          return true;
        break;

      case 'left':
        if ( curXIndex >= chunkMap[curZIndex].length )
          if ( chunkMap[curZIndex][curXIndex + 1] != 0 && chunkMap[curZIndex][curXIndex + 1] != null )
            return true;
        break;

      default:
        return false;
    }
  }
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
  verticesMap.push([curZIndex,curXIndex]);
  verticesMap[curZIndex][curXIndex] = vertices;
  vertices = [];
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
