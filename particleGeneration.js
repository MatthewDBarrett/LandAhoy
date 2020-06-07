import { getScene } from "../sceneController.js"

export class ParticleGen {
    constructor(pos, dir, maxParticles, maxLifetime, maxSpeed, autoGen, meshes, isDeviate, isRotate) {
        this.pos = pos;
        this.dir = dir;
        this.particles = [];
        this.maxParticles = maxParticles;
        this.maxLifetime = maxLifetime;
        this.autoGen = autoGen;
        this.maxSpeed = maxSpeed;
        this.clock = new THREE.Clock();
        this.delta = this.clock.getDelta();
        this.meshes = [];
        this.meshes = meshes;
        this.isDeviate = isDeviate;
        this.isRotate = isRotate;
    }

    autoLoop(){
        this.delta = this.clock.getDelta();
        if(this.autoGen && this.meshes.length != 0){
            if(this.particles.length < this.maxParticles){
                this.generateParticle();
            }
        }
        if(this.particles.length > 0){   
            for(var i = 0; i < this.particles.length; i++){
                this.updateParticle(this.particles[i], this.delta);
                this.updateOpacity(this.particles[i]);
                this.lifetimeDec(this.particles[i], this.delta);   
                this.checkLifetime(this.particles[i], i);
            }
        }
    }

    generateParticle(){
        var deviateDir = new THREE.Vector3();
        if(this.isDeviate){
            var max = 0.75;
            var min = -0.75;
            deviateDir = this.dir.clone();
            deviateDir.set(deviateDir.x + (Math.random() * (max - min)) + min, deviateDir.y + (Math.random() * (max - min)) + min, deviateDir.z);
        }

        //Generate particle
        var meshLength = this.meshes.length;
        var particle = new Particle(
            this.pos, 
            new THREE.Vector3(1, 0, 0), 
            (this.isDeviate ? deviateDir : this.dir),
            this.meshes[Math.floor(Math.random() * meshLength)],
            Math.random() * this.maxLifetime,
            Math.random() * this.maxSpeed,
            this.isRotate);
        this.particles.push(particle);
        this.addToScene(particle);
    }

    addToScene(particle){
        getScene().add(particle.getParticleMesh());
    }

    lifetimeDec(particle, delta){
        particle.lifetimeDecrement(delta);
    }

    updateParticle(particle, delta){
        particle.updateParticle(delta);
    }

    checkLifetime(particle, index){
        if(particle.getLifetime() < 0){
            this.removeParticle(particle, index);
        }
    }

    updateOpacity(particle){
        particle.setOpacity();
    }

    removeParticle(particle, index){
        var particle = this.particles[index];
        this.particles.splice(index, 1);
        this.deleteParticleFromScene(particle);
    }

    deleteParticleFromScene(particle){
        particle.particleMesh.geometry.dispose();
        particle.particleMesh.material.dispose();
        getScene().remove(particle.getParticleMesh());
        particle.particleMesh = null;
    }

    destroyAll(){
        for(var i = 0; i < this.particles.length; i++){
            this.deleteParticleFromScene(particle);
        }
        this.particles = [];
    }

    setAutoGen(){
        this.autoGen = !this.autoGen;
    }

    setPos(position){
        this.pos = position;
    }

    setDir(direction){
        this.dir = direction;
    }

    setMaxParticles(newMaxParticles){
        this.maxParticles = newMaxParticles;
    }
}

//Export for testing purposes!
//THIS CLASS HAS ASSUMES THAT THE MESH BEING PASSED INTO IT IS A SHADERMATERIAL!
//THIS NEEDS A SHADERMATERIAL TO WORK
export class Particle{
    constructor(pos, rot, dir, mesh, lifetime, initSpeed, isRotate){
        //Fields
        this.pos = pos;
        this.rot = rot;
        this.dir = dir;
        this.lifetime = lifetime;
        this.initialLifetime = lifetime;
        this.initSpeed = initSpeed;
        this.speed = initSpeed;
        this.isRotate = isRotate;
        // this.geometry = new THREE.Geometry();
        // this.material = new THREE.MeshNormalMaterial( );// {color: 0x00ff00}
        this.particleMesh = new THREE.Mesh(mesh[0].clone(), mesh[1].clone());
        this.direction = dir;
        this.cubeGeometry = new THREE.BoxGeometry(0.1,0.1,0.1);
        this.cubeMat = new THREE.MeshNormalMaterial();
        this.cubeMat.visible = true
        this.cube = new THREE.Mesh( this.cubeGeometry, this.cubeMat );

        //Random starting rotation
        if(isRotate){
            this.rot = new THREE.Vector3(Math.random() * 10, Math.random(), Math.random() * 50);
        }   
        else{
            //No rotation if no rotation on particles
            this.rot = dir;
        }

        //Set cube to same position as particle, but correct orientation.
        this.cube.position.set(this.pos.x, this.pos.y, this.pos.z);
        this.cube.rotation.set(this.dir.x, this.dir.y, this.dir.z, "YXZ");
    }

    //return lifetime
    getLifetime(){
        return this.lifetime;
    }

    //decrease lifetime
    lifetimeDecrement(dec){
        this.lifetime -= dec;
    }

    getParticleMesh(){
        return this.particleMesh;
    }
    
    getCube(){
        return this.cube;
    }

    setOpacity(){
        this.particleMesh.material.opacity = (this.lifetime)/this.initialLifetime;
    }

    setCurrentSpeed(){
        speed = (this.lifetime/this.initialLifetime) * 100;
    }

    //update position
    //update Shader state
    updateParticle(delta){
        if(this.isRotate){      
            this.rot.x += 0.1;
            this.rot.y += 0.1;
            this.rot.z += 0.1;
        }

        if(this.speed > 0){            
            this.cube.getWorldDirection(this.direction);
            this.cube.position.add( this.direction.multiplyScalar(this.speed));
            this.particleMesh.rotation.set(this.rot.x, this.rot.y, this.rot.z, "YXZ");
            this.particleMesh.position.set(this.cube.position.x, this.cube.position.y, this.cube.position.z);
        }

        //I hate this as much as anyone else does, but I have to do this I'm sorry no time to contemplate
        //Blue 62.0,101.0,192.0
        //Yellow 220.0,226.0,34.0
        //Orange 226.0,88.0,34.0
        //Red 226.0,40.0,34.0
        if(this.particleMesh.material.opacity > 0.75 ){
            this.particleMesh.material.uniforms.color2.value = new THREE.Vector3(62.0,101.0,192.0);
            this.particleMesh.material.uniforms.color1.value = new THREE.Vector3(220.0,226.0,34.0);
            this.particleMesh.material.uniforms.colorlerp.value = (this.particleMesh.material.opacity - 0.75)/0.25;
            this.particleMesh.material.uniforms.opacity.value = this.particleMesh.material.opacity;
        }
        else if(this.particleMesh.material.opacity > 0.5){
            this.particleMesh.material.uniforms.color2.value = new THREE.Vector3(62.0,101.0,192.0);
            this.particleMesh.material.uniforms.color1.value = new THREE.Vector3(220.0,226.0,34.0);
            this.particleMesh.material.uniforms.colorlerp.value = (this.particleMesh.material.opacity - 0.5)/0.25;
            this.particleMesh.material.uniforms.opacity.value = this.particleMesh.material.opacity;
        }
        else if(this.particleMesh.material.opacity > 0.25){
            this.particleMesh.material.uniforms.color2.value = new THREE.Vector3(220.0,226.0,34.0);
            this.particleMesh.material.uniforms.color1.value = new THREE.Vector3(226.0,88.0,34.0);
            this.particleMesh.material.uniforms.colorlerp.value = (this.particleMesh.material.opacity - 0.25)/0.25;
            this.particleMesh.material.uniforms.opacity.value = this.particleMesh.material.opacity;
        }
        else{
            this.particleMesh.material.uniforms.color1.value = new THREE.Vector3(226.0,40.0,34.0);
            this.particleMesh.material.uniforms.color2.value = new THREE.Vector3(226.0,40.0,34.0);
            this.particleMesh.material.uniforms.colorlerp.value = 1.0;
            this.particleMesh.material.uniforms.opacity.value = this.particleMesh.material.opacity;
        }
    }
}