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

    geometry = new THREE.PlaneBufferGeometry(worldWidth, worldDepth, worldWidth, worldDepth );
    
    regenerateTerrain(geometry, worldWidth, worldDepth);

    material = new THREE.MeshPhongMaterial( {map: groundTexture } );
    material.wireframe = false;
    groundMesh = new THREE.Mesh( geometry, material );

    groundMesh.position.set(0,-5,0);
    groundMesh.scale.set(400,400,1);
    groundMesh.rotation.x = -Math.PI/2;

    groundMesh.castShadow = false;
    groundMesh.receiveShadow = true;
}

export function getGround(){
    return groundMesh;    
}

function regenerateTerrain(geometry, worldWidth, worldDepth){
    for (var y = 0; y < worldDepth; y++) {
        elevation[y] = [];
        for (var x = 0; x < worldWidth; x++) {      
          var nx = x/worldWidth - 0.5, ny = y/worldDepth - 0.5;
          elevation[y][x] = noise(nx, ny) +  0.5 * noise(2 * nx, 2 * ny) + 0.25 * noise(4 * nx, 2 * ny);
          console.log(elevation[y][x]);
        }
    }

    var positionAttribute = geometry.attributes.position;
    for ( var i = 0; i < positionAttribute.count; i ++ ) {
        var x = positionAttribute.getX( i );
		var y = positionAttribute.getY( i );
        var z = positionAttribute.getZ( i ); 
        
        var newX = x + (worldWidth / 2);
        var newY = y + (worldDepth / 2);
        if(newY === worldDepth){
            newY = worldDepth - 1;
        }
        if(newX === worldWidth){
            newX = worldWidth - 1;
        }

        z = elevation[newY][newX] * frequency;
        console.log("z:" + z);

        positionAttribute.setXYZ( i, x, y, z );
    }
}

function noise(nx, ny) {
  // Rescale from -1.0:+1.0 to 0.0:1.0
  return simplexNoise.noise2D(nx, ny);
}