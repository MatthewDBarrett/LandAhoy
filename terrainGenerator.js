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
var currentSector = 0;

var curZIndex = 0;
var curXIndex = 0;

var spheres = [];

var triangle = [];
var numChunks = 0;

var lastVertDis = 0;
var lastXSize = 0;
var lastZSize = 0;

var startMapSize = 10;

var vertSelIteration = 0;

var chunksToggled = false;

var visibleChunks = [];

var renderHeight = 5;

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
  vertDistance: 2,
  xSize: 5,
  zSize: 5,
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
  CreateSector(2);   //Bottom Right
  CreateSector(3);   //Bottom Left
}

function CreateSector( sector ){
  chunkMap = [];

  for (var z = 0; z < startMapSize; z++){                                 //creating chunks, each interation is another chunk generated
    for (var x = 0; x < startMapSize; x++){
      NewChunk( sector, z, x );
    }
  }
  UpdateSectorAndVert( sector );
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

  if ( sector == 0 || sector == 1 ) {
    var connectAbove = CheckConnection('above');
    var connectBelow = CheckConnection('below');
  }

  if ( sector == 2 || sector == 3 ) {
    var connectBelow = CheckConnection('above');
    var connectAbove = CheckConnection('below');
  }

  if ( sector == 0 || sector == 3) {
    var connectRight = CheckConnection('right');
    var connectLeft = CheckConnection('left');
  }
  if ( sector == 1 || sector == 2 ) {
    var connectLeft = CheckConnection('right', sector);       //swapped for inverse x axis sector
    var connectRight = CheckConnection('left', sector);
  }

  options.amplitude = getRandomArbitrary(options.vertDistance / 5, options.vertDistance * 2);

  for (var z = 0; z <= options.zSize; z++){
    for (var x = 0; x <= options.xSize; x++){
      var yNoise = Math.random() * options.amplitude;

      if ( sector == 1 && sectorLeft && x == options.xSize) {             //Combine TOP LEFT sector to TOP RIGHT sector
        var sect = vertMaps[ sector - 1 ];
        var vertMap = sect[curZIndex][curXIndex];
        yNoise = vertMap[i - options.xSize].y + renderHeight;
      }

      if ( sector < 2 && connectBelow && z == 0){                         //TOP Connect Below
        if ( vertMaps[sector] )
          var vertMap = vertMaps[sector][curZIndex - 1][curXIndex];
        else
          var vertMap = verticesMap[curZIndex - 1][curXIndex];
        yNoise = vertMap[vertMap.length - options.zSize + (i-1)].y + renderHeight;
      }

      if ( sector >= 2 && sectorAbove && z == options.zSize) {                        //Cobmine BOTTOM RIGHT sector to TOP RIGHT sector
        if ( sector == 2 )
          var sect = vertMaps[ sector - 1 ];
        else if ( sector == 3 )
          var sect = vertMaps[ sector - 3 ];
        var vertMap = sect[curZIndex][curXIndex];
        yNoise = vertMap[ Math.abs(vertMap.length - i - (options.xSize + 1) ) ].y + renderHeight;
        //VertSelector(vertMap[Math.abs(vertMap.length - i - (options.xSize + 1) )].z,vertMap[Math.abs(vertMap.length - i - (options.xSize + 1) )].x);
      }

      if ( sector == 3 && sectorLeft && x == 0 ) {
        var sect = vertMaps[ sector - 1 ];
        var vertMap = sect[curZIndex][curXIndex];
        yNoise = vertMap[i + options.xSize].y + renderHeight;
      }

      if ( sector >= 2 && connectAbove && z == options.zSize) {            //BOTTOM Connect Above
        var vertMap = verticesMap[curZIndex - 1][curXIndex];
        yNoise = vertMap[ Math.abs(vertMap.length - i - (options.xSize + 1) ) ].y + renderHeight;
      }

      if ( connectRight && x == 0){                                       //Connect Right
        var vertMap = verticesMap[curZIndex][curXIndex - 1];
        yNoise = vertMap[(i) + options.xSize].y + renderHeight;
      }

      if ( connectLeft && x == options.xSize) {                           //Connect Left
        var vertMap = verticesMap[curZIndex][curXIndex - 1];
        yNoise = vertMap[i - options.xSize].y + renderHeight;
      }

      vertices.push( new THREE.Vector3(xPos + x * options.vertDistance, yNoise - renderHeight, zPos + z * options.vertDistance) );

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
  if ( !verticesMap[curZIndex] )
    verticesMap[curZIndex] = [];
  //verticesMap.push([curZIndex,curXIndex]);
  //console.log("ZX: ( " + curZIndex + ", " + curXIndex + " ) - " + vertices.length);
  verticesMap[curZIndex][curXIndex] = vertices;
  vertices = [];
}

function VertSelector(zPos, xPos) {
  zPos *= options.vertDistance;
  xPos *= options.vertDistance;

  var material = new THREE.LineBasicMaterial( { color: 0x0000ff } );

  var points = [];
  points.push( new THREE.Vector3( xPos, -renderHeight, zPos ) );
  points.push( new THREE.Vector3( xPos, vertSelIteration + 2 -renderHeight, zPos ) );

  var geometry = new THREE.BufferGeometry().setFromPoints( points );

  var line = new THREE.Line( geometry, material );

  addToScene( line );

  vertSelIteration += 0.25;
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

  var lastIndexPos = curIndexPos;

  var tempZ = Math.floor( ( getShipPos().z / options.zSize ) / options.vertDistance );
  var tempX = Math.floor( ( getShipPos().x / options.xSize ) / options.vertDistance );
  curIndexPos = new THREE.Vector2(tempZ, tempX);

  var lastSector = currentSector;

  var sectorIndex = new THREE.Vector2();

  if ( curIndexPos.x >= 0 && curIndexPos.y >= 0 ){
    currentSector = 0;
    sectorIndex = new THREE.Vector2( curIndexPos.x, curIndexPos.y );
  } else if ( curIndexPos.x >= 0 && curIndexPos.y < 0 ) {
    currentSector = 1;
    sectorIndex = new THREE.Vector2( Math.abs( curIndexPos.x ), Math.abs( curIndexPos.y + 1 ) );
  } else if ( curIndexPos.x < 0 && curIndexPos.y >= 0 ) {
    currentSector = 3;
    sectorIndex = new THREE.Vector2( Math.abs( curIndexPos.x  + 1 ), Math.abs( curIndexPos.y ) );
  } else if ( curIndexPos.x < 0 && curIndexPos.y < 0 ) {
    currentSector = 2;
    sectorIndex = new THREE.Vector2( Math.abs( curIndexPos.x + 1 ), Math.abs( curIndexPos.y + 1 ) );
  }

  if ( sectorMap.length > 0) {
    if ( chunksToggled ) {
      if ( currentSector != lastSector || curIndexPos.x != lastIndexPos.x || curIndexPos.y != lastIndexPos.y )
        ToggleChunks( currentSector, sectorIndex );
    } else {
      ToggleChunks( currentSector, sectorIndex );
      chunksToggled = true;
    }
  }

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

function ToggleChunks( currentSector, sectorIndex ) {
  var cMap = sectorMap[ currentSector ];

  // var createNewChunk = false;
  // if ( cMap[ sectorIndex.x ] ) {
  //   if ( cMap[ sectorIndex.x ][ sectorIndex.y ] < 10) {
  //     createNewChunk = true;
  //   }
  // } else {
  //   createNewChunk = true;
  // }
  //
  // if ( createNewChunk ) {
  //   NewChunk( currentSector, sectorIndex.x, sectorIndex.y );
  //   UpdateSectorAndVert( currentSector );
  // }

  var currentChunk = cMap[ sectorIndex.x ][ sectorIndex.y ];

  if ( !chunksToggled ) {
    for ( var s = 0; s < sectorMap.length; s++ )
      for ( var z = 0; z < chunkMap.length; z++ )         //Unshow all chunks
        for ( var x = 0; x < chunkMap[z].length; x++ )
          HideChunk( s, z, x );
  } else {
    for ( var i = 0; i < visibleChunks.length; i++ ) {
      HideChunk( visibleChunks[ i ].x, visibleChunks[ i ].y, visibleChunks[ i ].z );
    }
    visibleChunks = [];
  }

  ShowChunk(currentSector, sectorIndex.x, sectorIndex.y);                         //Current Chunk

  if ( currentSector >= 2 ) {                                                     //Above
    if ( sectorIndex.x == 0 ) {
      ShowChunk( currentSector == 2 ? 1 : 0, sectorIndex.x, sectorIndex.y );
    } else
      ShowChunk(currentSector, sectorIndex.x - 1, sectorIndex.y);
  } else
      ShowChunk(currentSector, sectorIndex.x + 1, sectorIndex.y);

  if ( currentSector <= 1 ) {                                                     //Below
    if ( sectorIndex.x == 0 ) {
      ShowChunk( currentSector == 0 ? 3 : 2, sectorIndex.x, sectorIndex.y );
    } else
      ShowChunk(currentSector, sectorIndex.x - 1, sectorIndex.y);
  } else
      ShowChunk(currentSector, sectorIndex.x + 1, sectorIndex.y);

  if ( currentSector == 0 || currentSector == 3 ) {                               //Right
    if ( sectorIndex.y == 0 ) {
      ShowChunk( currentSector == 0 ? 1 : 2, sectorIndex.x, sectorIndex.y );
    } else
      ShowChunk(currentSector, sectorIndex.x, sectorIndex.y - 1);
  } else
      ShowChunk(currentSector, sectorIndex.x, sectorIndex.y + 1);

  if ( currentSector == 1 || currentSector == 2 ) {                               //Left
    if ( sectorIndex.y == 0 ) {
      ShowChunk( currentSector == 1 ? 0 : 3, sectorIndex.x, sectorIndex.y );
    } else
      ShowChunk(currentSector, sectorIndex.x, sectorIndex.y - 1);
  } else
      ShowChunk(currentSector, sectorIndex.x, sectorIndex.y + 1);

  if ( currentSector == 0 ) {                                                    //Top Left
    ShowChunk(currentSector, sectorIndex.x + 1, sectorIndex.y + 1);
  } else if ( currentSector == 1 ) {
    sectorIndex.y == 0 ? ShowChunk(0, sectorIndex.x + 1, sectorIndex.y) : ShowChunk(1, sectorIndex.x + 1, sectorIndex.y - 1);
  } else if ( currentSector == 2 ) {
    if ( sectorIndex.y == 0 ){
      sectorIndex.x == 0 ? ShowChunk(0, 0, 0) : ShowChunk(3, sectorIndex.x - 1, sectorIndex.y);
    } else if ( sectorIndex.x == 0 ){
      ShowChunk(1, sectorIndex.x, sectorIndex.y - 1);
    } else {
      ShowChunk(2, sectorIndex.x - 1, sectorIndex.y - 1);
    }
  } else if ( currentSector == 3 )
    sectorIndex.x == 0 ? ShowChunk(0, sectorIndex.x, sectorIndex.y + 1) : ShowChunk(3, sectorIndex.x - 1, sectorIndex.y + 1);

  if ( currentSector == 1 ) {                                                    //Top Right
    ShowChunk(currentSector, sectorIndex.x + 1, sectorIndex.y + 1);
  } else if ( currentSector == 0 ) {
    sectorIndex.y == 0 ? ShowChunk(1, sectorIndex.x + 1, sectorIndex.y) : ShowChunk(0, sectorIndex.x + 1, sectorIndex.y - 1);
  } else if ( currentSector == 3 ) {
    if ( sectorIndex.y == 0 ){
      sectorIndex.x == 0 ? ShowChunk(1, 0, 0) : ShowChunk(2, sectorIndex.x - 1, sectorIndex.y);
    } else if ( sectorIndex.x == 0 ){
      ShowChunk(0, sectorIndex.x, sectorIndex.y - 1);
    } else {
      ShowChunk(3, sectorIndex.x - 1, sectorIndex.y - 1);
    }
  } else if ( currentSector == 2 )
    sectorIndex.x == 0 ? ShowChunk(1, sectorIndex.x, sectorIndex.y + 1) : ShowChunk(2, sectorIndex.x - 1, sectorIndex.y + 1);

  if ( currentSector == 2 ) {                                                    //Bottom Right
    ShowChunk(currentSector, sectorIndex.x + 1, sectorIndex.y + 1);
  } else if ( currentSector == 1 ) {
    sectorIndex.x == 0 ? ShowChunk(2, sectorIndex.x, sectorIndex.y + 1) : ShowChunk(1, sectorIndex.x - 1, sectorIndex.y + 1);
  } else if ( currentSector == 0 ) {
    if ( sectorIndex.y == 0 ){
      sectorIndex.x == 0 ? ShowChunk(2, 0, 0) : ShowChunk(1, sectorIndex.x - 1, sectorIndex.y);
    } else if ( sectorIndex.x == 0 ){
      ShowChunk(3, sectorIndex.x, sectorIndex.y - 1);
    } else {
      ShowChunk(0, sectorIndex.x - 1, sectorIndex.y - 1);
    }
  } else if ( currentSector == 3 )
    sectorIndex.y == 0 ? ShowChunk(2, sectorIndex.x + 1, sectorIndex.y) : ShowChunk(3, sectorIndex.x + 1, sectorIndex.y - 1);

  if ( currentSector == 3 ) {                                                    //Bottom Left
    ShowChunk(currentSector, sectorIndex.x + 1, sectorIndex.y + 1);
  } else if ( currentSector == 0 ) {
    sectorIndex.x == 0 ? ShowChunk(3, sectorIndex.x, sectorIndex.y + 1) : ShowChunk(0, sectorIndex.x - 1, sectorIndex.y + 1);
  } else if ( currentSector == 1 ) {
    if ( sectorIndex.y == 0 ){
      sectorIndex.x == 0 ? ShowChunk(3, 0, 0) : ShowChunk(0, sectorIndex.x - 1, sectorIndex.y);
    } else if ( sectorIndex.x == 0 ){
      ShowChunk(2, sectorIndex.x, sectorIndex.y - 1);
    } else {
      ShowChunk(1, sectorIndex.x - 1, sectorIndex.y - 1);
    }
  } else if ( currentSector == 2 )
    sectorIndex.y == 0 ? ShowChunk(3, sectorIndex.x + 1, sectorIndex.y) : ShowChunk(2, sectorIndex.x + 1, sectorIndex.y - 1);

}

function HideChunk(sector, z, x){
  var cMap = sectorMap[ sector ];
  if ( !(typeof cMap[z][x] === "undefined") ) {
    var triArray = cMap[z][x];
    for (var i = 0; i < triArray.length; i++)
      triArray[i].visible = false;
  }
}

function ShowChunk(sector, z, x){
  visibleChunks.push( new THREE.Vector3( sector, z, x ) );
  var cMap = sectorMap[ sector ];
  if ( !(typeof cMap[z][x] === "undefined") ) {
    var triArray = cMap[z][x];
    for (var i = 0; i < triArray.length; i++)
      triArray[i].visible = true;
  }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function MergeSectorsAndCreate( sect, zPos, xPos, z, x ) {
  if ( sect == 1 && x == 0 ) {
    CreateShape(xPos, zPos, sect, true, false);
  } else if ( sect == 2 && z == 0 ) {
    CreateShape(xPos, zPos, sect, false, true);
  } else if ( sect == 3 ) {
    if ( z == 0 && x == 0 ) {
      CreateShape(xPos, zPos, sect, true, true);
    } else if ( z == 0 ) {
      CreateShape(xPos, zPos, sect, false, true);
    } else if ( x == 0 ) {
      CreateShape(xPos, zPos, sect, true, false);
    } else {
      CreateShape(xPos, zPos, sect, false, false);
    }
  } else {
    CreateShape(xPos, zPos, sect, false, false);
  }
}

function DetermineZPos( sect, z ){
  var zPos = 0;

  if ( sect < 2 )
    zPos = ( options.vertDistance * ( options.zSize ) ) * z;

  if ( sect >= 2 ) {
    if ( z == 0 )
      zPos = - ( options.vertDistance * ( options.zSize ) );
    else
      zPos = -(z+1) * ( options.vertDistance * ( options.zSize ) );
  }

  return zPos;
}

function DetermineXPos( sect, x ){
  var xPos = 0;

  if ( sect == 0 || sect == 3 )
    xPos = ( options.vertDistance * ( options.xSize ) ) * x;

  if ( sect == 1 || sect == 2 ){
    if ( x == 0 )
      xPos = - ( options.vertDistance * ( options.xSize ) );
    else
      xPos = -(x+1) * ( options.vertDistance * ( options.xSize ) );
  }

  return xPos;
}

function NewChunk( sect, z, x ){
  var zPos = DetermineZPos( sect, z );
  var xPos = DetermineXPos( sect, x );

  curZIndex = z;
  curXIndex = x;

  MergeSectorsAndCreate( sect, zPos, xPos, z, x );

  chunkMap.push([z,x]);
  chunkMap[z][x] = chunk;

  chunk = [];
}

function UpdateSectorAndVert( sect ){
  if ( sectorMap.length != 4 )
    sectorMap.push( [ sect ] );

  sectorMap[ sect ] = chunkMap;

  if ( vertMaps.length != 4 )
    vertMaps.push( sect );

  vertMaps[ sect ] = verticesMap;
  verticesMap = [];
}

animate();
