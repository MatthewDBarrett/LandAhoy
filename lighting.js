import { getScene } from '../sceneController.js'

export class Lighting{
    constructor(){
        this.light = new THREE.DirectionalLight(
            new THREE.Color(1,1,1), 						//color
            1,																	//intensity
        );
        this.light.castShadow = true;
        this.light.receiveShadow = true;

        this.addToScene(this.light);
    }

    getLight(){
        return this.light;
    }

    addToScene(light){
        getScene().add(light);
    }

    getColor(){
        return this.light.color;
    }

    getPosition(){
        return this.light.position;
    }

    setPosition(position){
        this.light.position.set(position.x, position.y, position.z);
    }
}