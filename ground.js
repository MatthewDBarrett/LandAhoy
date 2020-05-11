var groundTexture;
var geometry;
var material;
var groundMesh;

export function ground(worldWidth, worldDepth){
    groundTexture = new THREE.TextureLoader().load( "textures/grass.jpg" );
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.x = 20;
    groundTexture.repeat.y = 20;

    geometry = new THREE.PlaneBufferGeometry( 1, 1, 10, 10 );
    
    regenerateTerrain(geometry);

    material = new THREE.MeshPhongMaterial( {map: groundTexture } );
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

function regenerateTerrain(geometry){
    // modify geometry
		
	var positionAttribute = geometry.attributes.position;

	for ( var i = 0; i < positionAttribute.count; i ++ ) {
		
		// access single vertex (x,y,z)
		
		var x = positionAttribute.getX( i );
		var y = positionAttribute.getY( i );
		var z = positionAttribute.getZ( i );
			
		// modify data (in this case just the z coordinate)
        z += Math.random() * 20;
			
		// write data back to attribute
		positionAttribute.setXYZ( i, x, y, z );	
    }
}