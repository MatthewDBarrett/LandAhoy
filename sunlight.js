import { getScene } from '../sceneController.js'
import { GetShip, getShipPos } from '../ship.js'

export class Sunlight{
    constructor(){
        this.ambient = new THREE.AmbientLight(
            new THREE.Color(1,1,1), 						//color
            0.1,																	//intensity
        );
        this.sunlight = new THREE.DirectionalLight(
            new THREE.Color(1,1,1),
            0.8
        );

        //timer
        this.seasonTimer = 45;
        this.overallTimer = this.seasonTimer;
        this.clock = new THREE.Clock();
        this.seasonNum = 0;

        this.season = [];
        this.season.push(["morning", new THREE.Color(1, 1, 1)]);
        this.season.push(["sunset", new THREE.Color(253/255, 94/255, 83/255)]);
        this.season.push(["night", new THREE.Color(67/255, 67/255, 103/255)]);
        this.season.push(["sunrise", new THREE.Color(1, 77/255, 0/255)]);

        this.sunlightspot = new THREE.Mesh(new THREE.BoxGeometry(2,2,2), new THREE.MeshNormalMaterial);
        this.centerPointSunlight = new THREE.Mesh(new THREE.BoxGeometry(2,2,2), new THREE.MeshNormalMaterial);
        this.sunlight.position.set(this.sunlight.position.x, this.sunlight.position.y + 10, this.sunlight.position.z);
        this.sunlightspot.position.set(this.sunlight.position.x, this.sunlight.position.y + 10, this.sunlight.position.z);
        this.centerPointSunlight.add(this.sunlight);
        this.centerPointSunlight.add(this.sunlightspot);

        this.sunlight.castShadow = true;
        this.sunlight.receiveShadow = true;

        
        this.addToScene(this.centerPointSunlight);
        this.addToScene(this.ambient);
    }

    checkSeason(){
        if(this.overallTimer % 360 <= 90){
            this.seasonNum = 0;
        }
        else if(this.overallTimer % 360 <= 180){
            this.seasonNum = 1;
        }
        else if(this.overallTimer % 360 <= 270){
            this.seasonNum = 2;
        }
        else if(this.overallTimer % 360 <= 360){
            this.seasonNum = 3;
        }
    }

    getSunlight(){
        return this.sunlight;
    }

    addToScene(light){
        getScene().add(light);
    }

    setSunlightTarget(obj){
        this.sunlight.target = obj;
    }

    getSunlightColor(){
        return this.sunlight.color;
    }

    getSunlightPosition(){
        return this.sunlight.position;
    }

    setSunlightPosition(position){
        this.sunlight.position.set(position.x, position.y, position.z);
    }

    setCenterPoint(position){
        this.centerPointSunlight.position.set(position.x, position.y, position.z);
    }

    setCenterPointRotation(rotX){
        this.centerPointSunlight.rotateZ(rotX);
    }
    
    setSunlightIntensity(intensity){
        this.sunlight.intensity = intensity;
    }

    setSunlightColor(color){
        this.sunlight.color = color;
    }

    update(){
        var delta = this.clock.getDelta();
        this.setSunlightTarget(GetShip());
        this.setCenterPoint(getShipPos());
        this.seasonTimer += delta;
        this.overallTimer += delta;
        console.log(this.overallTimer);
        if(this.seasonTimer >= 90){
            this.checkSeason();
            this.seasonTimer = 0;
        }

        //Lerping colours
        var lerpVal = 0;
        var needsLerp = false;
        var nextIndex = 0;
        if(this.seasonTimer < 10){
            needsLerp = true;
            lerpVal = (this.seasonTimer/20) + 0.5;
            console.log(lerpVal);
        }
        else if(this.seasonTimer - 80 > 0){
            needsLerp = true;
            lerpVal = ( (this.seasonTimer - 80)/20);
        }
        //getNextIndex
        nextIndex += (this.seasonNum + 1);
        if(nextIndex == 4){
            nextIndex = 0;
        }

        if(needsLerp){
            this.setSunlightColor( this.season[this.seasonNum][1].lerp( this.season[nextIndex][1] , lerpVal) );
        }
        else{
            this.setSunlightColor( this.season[this.seasonNum][1] );
        }    
        // sunlight.setCenterPointRotation(THREE.Math.degToRad(angle%360));
        
        //Finish this tomorrow
        //Implement the clock, and time the sunset, sunrise, morning and night,
        //Implement the lerp function for colours, by storing the colour in var
        //implement the clock functionality, by storing the time of day as a enumerator and store a var that checks if the season is at 70 seconds.
    }
}