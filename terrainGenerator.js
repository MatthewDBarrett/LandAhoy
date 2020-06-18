import { addToScene, loadFile, getLighting, shaderParse } from '../sceneController.js'
import { removeFromScene } from '../sceneController.js'
import { getShipDir, GetShip, getShipPos } from '../ship.js';

var chunk = [];
var chunks = [];
var chunkMap = [];

var sectorMap = [];           // 0 = TL | 1 = TR | 2 = BR | 3 = BL

var vertices = [];
var verticesMap = [];
var vertMaps = [];

var toggledChunks = [];

var curIndexPos = new THREE.Vector2();

var curZIndex = 0;
var curXIndex = 0;

var spheres = [];

var triangle = [];
var numChunks = 0;

var lastVertDis = 0;
var lastXSize = 0;
var lastZSize = 0;

var startMapSize = 2;

var groundVertShader = loadFile('./shaders/groundNormVertShader.glsl');
var groundFragShader = loadFile('./shaders/groundNormFragShader.glsl');
groundVertShader = shaderParse(groundVertShader);
groundFragShader = shaderParse(groundFragShader);

var material = new THREE.ShaderMaterial({
  vertexShader: groundVertShader,
  fragmentShader: groundFragShader,
  uniforms: THREE.UniformsUtils.merge([
    THREE.UniformsLib.shadowmap,
    {
        lightPos: {type: 'v3', value: new THREE.Vector3(1, 1, 1)},
        time: {type: 'f', value: 0},
        lightColor: {value: new THREE.Vector3()},
        landscapeColor: {value: new THREE.Vector3()}
    }
  ])
});

var options = {
  vertDistance: 1,
  xSize: 10,
  zSize: 10,
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
  CreateSector(0);   //Top Left
  CreateSector(1);   //Top Right
}

function CreateSector( sector ){
  chunkMap = [];

  for (var z = 0; z < startMapSize; z++){                                 //creating chunks, each interation is another chunk generated
    for (var x = 0; x < startMapSize; x++){
      var zPos = ( options.vertDistance * ( options.zSize ) ) * z;

      if ( sector == 0 )
        var xPos = ( options.vertDistance * ( options.xSize ) ) * x;

      if ( sector == 1 ){
        if ( x == 0 )
          var xPos = - ( options.vertDistance * ( options.xSize ) );
        else
          var xPos = -(x+1) * ( options.vertDistance * ( options.xSize ) );
      }

      curZIndex = z;
      curXIndex = x;

      //console.log('-- z: ' + z + ' x: ' + x);

      if ( sector == 1 && x == 0 )
        CreateShape(xPos, zPos, sector, true, false);
      else
        CreateShape(xPos, zPos, sector, false, false);

      chunkMap.push([z,x]);
      chunkMap[z][x] = chunk;

      chunk = [];
    }
  }
  sectorMap.push( [ sector ] );
  sectorMap[ sector ] = chunkMap;

  vertMaps.push( verticesMap );
  //vertMaps.push(  [ sector ]  );
  //vertMaps[ sector ] = verticesMap;
  verticesMap = [];
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

function CreateShape(xPos, zPos, sector, sectorLeft, sectorAbove) {

  var i = 0;
  var connectAbove = CheckConnection('above');
  var connectBelow = CheckConnection('below');

  if ( sector == 0 ) {
    var connectRight = CheckConnection('right');
    var connectLeft = CheckConnection('left');
  }
  if ( sector == 1 ) {
    var connectLeft = CheckConnection('right', sector);       //swapped for inverse x axis sector
    var connectRight = CheckConnection('left', sector);
  }

  options.amplitude = getRandomArbitrary(options.vertDistance / 5, options.vertDistance * 2);

  for (var z = 0; z <= options.zSize; z++){
    for (var x = 0; x <= options.xSize; x++){
      var yNoise = Math.random() * options.amplitude;

      if ( sector == 1 && sectorLeft && x == options.xSize){
        var temp = vertMaps[ 0 ];
        var vertMap = temp[curZIndex][curXIndex];
        yNoise = vertMap[i - options.xSize].y;
      }

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

      if ( connectLeft && x == options.xSize) {
        var vertMap = verticesMap[curZIndex][curXIndex - 1];
        yNoise = vertMap[i - options.xSize].y;
      }

      vertices.push( new THREE.Vector3(xPos + x * options.vertDistance, yNoise, zPos + z * options.vertDistance) );

      i++;
    }
  }

  RenderChunk();
}

function CheckConnection(side, sector){

  var map = sectorMap[ sectorMap ];

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

  material.uniforms.lightColor.value = getLighting().getColor();
  material.uniforms.lightPos.value = getLighting().getPosition();
  material.uniforms.landscapeColor.value = new THREE.Vector3( 1, 1, 1);
  // material.lights = true;

  var mesh = new THREE.Mesh( geom, new THREE.MeshPhongMaterial(0x00ff00) );
  mesh.receiveShadow = true;
  mesh.castShadow = false;

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

  var tempZ = Math.floor( ( getShipPos().z / options.zSize ) / options.vertDistance );
  var tempX = Math.floor( ( getShipPos().x / options.xSize ) / options.vertDistance );
  curIndexPos = new THREE.Vector2(tempZ, tempX);
  //console.log("Z: " + curIndexPos.x + " X: " + curIndexPos.y);

  //toggleChunks();

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
      HideChunk(0,0);
      options.hide = 'None';
    } else if (options.hide == 'Chunk 2'){
      HideChunk(0,1);
      options.hide = 'None';
    } else if (options.hide == 'Chunk 3'){
      HideChunk(1,0);
      options.hide = 'None';
    }
  }

  if (options.show != null && options.show!= 'None'){
    if (options.show == 'Chunk 1'){
      ShowChunk(0,0);
      options.show = 'None';
    } else if (options.show == 'Chunk 2'){
      ShowChunk(0,1);
      options.show = 'None';
    } else if (options.show == 'Chunk 3'){
      ShowChunk(1,0);
      options.show = 'None';
    }
  }

}

function toggleChunks(){
  if ( chunkMap.length > 0 ) {
    var currentChunk = chunkMap[curIndexPos.x][curIndexPos.y];

    for ( var z = 0; z < chunkMap.length; z++ ) {                //Unshow all chunks
      for ( var x = 0; x < chunkMap[z].length; x++ ) {
        HideChunk(z,x);
      }
    }

    if ( !currentChunk[0].visible )                             //check that currentChunk is visible
      ShowChunk(curIndexPos.x, curIndexPos.y);

    if( !chunkMap[curIndexPos.x + 1][curIndexPos.y][0].visible )    //Above
      ShowChunk(curIndexPos.x + 1, curIndexPos.y);

    if( !chunkMap[curIndexPos.x - 1][curIndexPos.y][0].visible )    //Below
      ShowChunk(curIndexPos.x - 1, curIndexPos.y);

    if( !chunkMap[curIndexPos.x][curIndexPos.y - 1][0].visible )    //Right
      ShowChunk(curIndexPos.x, curIndexPos.y - 1);

    if( !chunkMap[curIndexPos.x][curIndexPos.y + 1][0].visible )    //Left
      ShowChunk(curIndexPos.x, curIndexPos.y + 1);

    if( !chunkMap[curIndexPos.x + 1][curIndexPos.y + 1][0].visible )    //Top Left Corner
      ShowChunk(curIndexPos.x + 1, curIndexPos.y + 1);

    if( !chunkMap[curIndexPos.x + 1][curIndexPos.y - 1][0].visible )    //Top Right Corner
      ShowChunk(curIndexPos.x + 1, curIndexPos.y - 1);

    if( !chunkMap[curIndexPos.x - 1][curIndexPos.y + 1][0].visible )    //Bottom Left Corner
      ShowChunk(curIndexPos.x - 1, curIndexPos.y + 1);

    if( !chunkMap[curIndexPos.x - 1][curIndexPos.y - 1][0].visible )    //Bottom Right Corner
      ShowChunk(curIndexPos.x - 1, curIndexPos.y - 1);
  }
}

function HideChunk(z, x){
  var triArray = chunkMap[z][x];
  for (var i = 0; i < triArray.length; i++)
    triArray[i].visible = false;
}

function ShowChunk(z, x){
  var triArray = chunkMap[z][x];
  for (var i = 0; i < triArray.length; i++)
    triArray[i].visible = true;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

animate();
