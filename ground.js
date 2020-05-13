import { getShipPos, setShipPos } from '../ship.js';

var simplexNoise = new SimplexNoise();
var groundTexture;
var geometry;
var material;
var groundMesh;
var elevation = [];
var frequency = 1500;

export function ground(worldWidth, worldDepth){
    groundTexture = new THREE.TextureLoader().load( "textures/grass.jpg" );
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.x = 20;
    groundTexture.repeat.y = 20;

    geometry = new THREE.PlaneBufferGeometry( 7500, 7500, worldWidth -1, worldDepth -1);
    geometry.rotateX( - Math.PI / 2 );
    
    var data = generateHeight(worldWidth, worldDepth);
    var vertices = geometry.attributes.position.array;
    
    setShipPos(getShipPos().x, data[ worldWidth/2 + worldDepth/2 * worldWidth ] * 10 + 500, getShipPos().z);
    for ( var i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {
    	vertices[ j + 1 ] = data[ i ] * 10;
    }

    // var texture = new THREE.CanvasTexture( generateTexture( data, worldWidth, worldDepth ) );
    // texture.wrapS = THREE.ClampToEdgeWrapping;
    // texture.wrapT = THREE.ClampToEdgeWrapping;

    //material = new THREE.MeshBasicMaterial({ map: texture } );
    material = new THREE.MeshPhongMaterial( {map: groundTexture } );
    material.wireframe = false;
    groundMesh = new THREE.Mesh( geometry, material );

    // groundMesh.position.set(0,-5,0);
    // groundMesh.scale.set(400,400,1);
    // groundMesh.rotation.x = -Math.PI/2;

    groundMesh.castShadow = false;
    groundMesh.receiveShadow = true;
}

export function getGround(){
    return groundMesh;    
}

function noise(nx, ny, nz) {
  // Rescale from -1.0:+1.0 to 0.0:1.0
  return simplexNoise.noise3D(nx, ny, nz);
}

function generateHeight( width, height ) {

    var size = width * height, data = new Uint8Array( size ),
        quality = 0.5, z = Math.random() * 100;

    for ( var j = 0; j < 4; j ++ ) {
        for ( var i = 0; i < size; i ++ ) {
            var x = i % width, y = ~ ~ ( i / width );
            data[ i ] += Math.abs( noise( x / quality, y / quality, z ) * quality * 1.75 );
        }
        quality *= 5;
    }

    return data;

}

function generateTexture( data, width, height ) {

    var canvas, canvasScaled, context, image, imageData, vector3, sun, shade;

    vector3 = new THREE.Vector3( 0, 0, 0 );

    sun = new THREE.Vector3( 1, 1, 1 );
    sun.normalize();

    canvas = document.createElement( 'canvas' );
    canvas.width = width;
    canvas.height = height;

    context = canvas.getContext( '2d' );
    context.fillStyle = '#000';
    context.fillRect( 0, 0, width, height );

    image = context.getImageData( 0, 0, canvas.width, canvas.height );
    imageData = image.data;

    for ( var i = 0, j = 0, l = imageData.length; i < l; i += 4, j ++ ) {

        vector3.x = data[ j - 2 ] - data[ j + 2 ];
        vector3.y = 2;
        vector3.z = data[ j - width * 2 ] - data[ j + width * 2 ];
        vector3.normalize();

        shade = vector3.dot( sun );

        imageData[ i ] = ( 96 + shade * 128 ) * ( 0.5 + data[ j ] * 0.007 );
        imageData[ i + 1 ] = ( 32 + shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );
        imageData[ i + 2 ] = ( shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );

    }

    context.putImageData( image, 0, 0 );

    // Scaled 4x

    canvasScaled = document.createElement( 'canvas' );
    canvasScaled.width = width * 4;
    canvasScaled.height = height * 4;

    context = canvasScaled.getContext( '2d' );
    context.scale( 4, 4 );
    context.drawImage( canvas, 0, 0 );

    image = context.getImageData( 0, 0, canvasScaled.width, canvasScaled.height );
    imageData = image.data;

    for ( var i = 0, l = imageData.length; i < l; i += 4 ) {

        var v = ~ ~ ( Math.random() * 5 );

        imageData[ i ] += v;
        imageData[ i + 1 ] += v;
        imageData[ i + 2 ] += v;

    }

    context.putImageData( image, 0, 0 );

    return canvasScaled;

}

// MIGHT NEED FOR LATER

// function regenerateTerrain(geometry, worldWidth, worldDepth){
//     for (var y = 0; y < worldDepth; y++) {
//         elevation[y] = [];
//         for (var x = 0; x < worldWidth; x++) {      
//           var nx = x/worldWidth, ny = y/worldDepth;
//           elevation[y][x] = frequency * noise(nx, ny);
//           console.log(elevation[y][x]);
//         }
//     }

//     var positionAttribute = geometry.attributes.position;
//     for ( var i = 0; i < positionAttribute.count; i ++ ) {
//         var x = positionAttribute.getX( i );
// 		var y = positionAttribute.getY( i );
//         var z = positionAttribute.getZ( i ); 

//         var newX = x + (worldWidth / 2);
//         var newY = y + (worldDepth / 2);
//         if(newY === worldDepth){
//             newY = worldDepth - 1;
//         }
//         if(newX === worldWidth){
//             newX = worldWidth - 1;
//         }

//         if(x === 0 && y === 0){
//             console.log("z: " + z );
//             console.log(getShipPos());

//             // var vec = new THREE.Vector3(x, y, z);
//             setShipPos(x, y + 10, z);
//             console.log(getShipPos());
//         }
//         z = elevation[newY][newX];

//         positionAttribute.setXYZ( i, x, y, z );
//     }
// }