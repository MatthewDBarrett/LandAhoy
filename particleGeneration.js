export class ParticleGen {
    
    constructor(pos, dir) {
        this.pos = pos;
        this.dir = dir;
        this.particles = [];
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
        //this.dir = dir;
        this.lifetime = lifetime;
        this.speed = initSpeed;
        this.geometry = new THREE.Geometry();
        this.material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
        this.particleMesh = null;
        this.direction = new THREE.Vector3();
        this.box = null;

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

        //Combine to make mesh
        this.particleMesh = new THREE.Mesh( this.geometry, this.material );

        //Random starting rotation
        this.rot = new THREE.Vector3(Math.random(), Math.random(), Math.random());

        //Reset axis to the center of the thing
        this.box = new THREE.Box3().setFromObject( this.particleMesh );
        this.box.center(this.particleMesh.position);
        this.particleMesh.position.multiplyScalar(-1);

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

    //update position
    updateParticle(){
        this.rot.x += 0.1;
        this.rot.y += 0.1;
        this.rot.z += 0.1;
        if(this.speed > 0){            
            this.particleMesh.getWorldDirection( this.direction );
            this.particleMesh.position.add( this.direction.multiplyScalar(this.speed));
            this.particleMesh.rotation.set(this.rot.x, this.rot.y, this.rot.z)
        }
        console.log(this.particleMesh.position);
    }
}

