export class ParticleGen {
    
    constructor(pos, dir, scene) {
        this.pos = pos;
        this.dir = dir;
        this.scene = scene;
        this.particles = [];
    }

    generateParticle(){
        var particle = new Particle(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 1), 111, 0.0001);
    }

    addToScene(particle){
        this.scene.add(particle);
    }
    //TODO
    /*
    1) Spawn a particle(add it at the end)
    2) Delete a particle(delete a particle at a given index)
    3) Check Lifetime of particle
    4) Destroy all particles
    5) Set spawn rate
    6) 
    */
}

//Export for testing purposes!
export class Particle{
    constructor(pos, rot, dir, lifetime, initSpeed){
        //Fields
        this.pos = pos;
        this.rot = rot;
        this.dir = dir;
        this.lifetime = lifetime;
        this.speed = initSpeed;
        this.geometry = new THREE.Geometry();
        this.material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
        this.particleMesh = null;
        this.direction = dir;
        this.cubeGeometry = new THREE.BoxGeometry(0.1,0.1,0.1);
        this.cubeMat = new THREE.MeshNormalMaterial();
        this.cubeMat.visible = true
        this.cube = new THREE.Mesh( this.cubeGeometry, this.cubeMat );

        //messy triangle gen
        var v1 = new THREE.Vector3(0,0,0);
        var v2 = new THREE.Vector3(1,0,0);
        var v3 = new THREE.Vector3(1,1,0);
        this.geometry.vertices.push(v1);
        this.geometry.vertices.push(v2);
        this.geometry.vertices.push(v3);
        this.geometry.faces.push( new THREE.Face3(0, 1, 2) );   
        this.geometry.computeFaceNormals();
        this.material.side = THREE.DoubleSide;
        this.material.wireframe = false;
        this.geometry.translate( -0.5, -0.5, 0 );

        //Combine to make mesh
        this.particleMesh = new THREE.Mesh( this.geometry, this.material );

        //Random starting rotation
        this.rot = new THREE.Vector3(Math.random() * 10, Math.random(), Math.random() * 50);

        //Set cube to same position as particle, but correct orientation.
        this.cube.position.set(this.pos.x, this.pos.y, this.pos.z);
        this.cube.rotation.set(this.dir.x, this.dir.y, this.dir.z);
    }

    //return lifetime
    getLifetime(){
        return this.lifetime;
    }

    //decrease lifetime
    lifetimeDecrement(dec){
        lifetime -= dec;
    }

    getParticleMesh(){
        return this.particleMesh;
    }
    
    getCube(){
        return this.cube;
    }

    //update position
    updateParticle(delta){
        this.rot.x += 0.1;
        this.rot.y += 0.1;
        this.rot.z += 0.1;
        if(this.speed > 0){            
            this.cube.getWorldDirection(this.direction);
            this.cube.position.add( this.direction.multiplyScalar(this.speed));
            //this.particleMesh.rotation.set(this.rot.x, this.rot.y, this.rot.z);
            this.particleMesh.position.set(this.cube.position.x, this.cube.position.y, this.cube.position.z);
            console.log(this.cube.position);
        }
    }
}