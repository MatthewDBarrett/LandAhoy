import { getScene } from '../sceneController.js'
import { GetShip, getShipPos } from '../ship.js'

export class Sunlight{
    constructor(){
        this.ambient = new THREE.AmbientLight(
            new THREE.Color(1,1,1), 						//color
            0.05,																	//intensity
        );
        this.sunlight = new THREE.DirectionalLight(
            new THREE.Color(1,1,1),
            0.7
        );
        this.hemisphere = new THREE.HemisphereLight( 0xffffbb, 0x080820, 0.2 );

        //timer
        this.seasonTimer = 0;
        this.overallTimer = 45;
        this.clock = new THREE.Clock();
        this.seasonNum = 0;
        this.prevSeasonNum = 3;

        this.season = [];
        this.season.push(["morning", new THREE.Color(1, 1, 1), 0.8]);
        this.season.push(["sunset", new THREE.Color(253/255, 94/255, 83/255), 0.4]);
        this.season.push(["night", new THREE.Color(67/255, 67/255, 103/255), 0.1]);
        this.season.push(["sunrise", new THREE.Color(1, 77/255, 0/255), 0.4]);

        this.sunlightspot = new THREE.Mesh(new THREE.BoxGeometry(2,2,2), new THREE.MeshNormalMaterial);
        this.centerPointSunlight = new THREE.Mesh(new THREE.BoxGeometry(2,2,2), new THREE.MeshNormalMaterial);
        this.sunlight.position.set(this.sunlight.position.x + 10, this.sunlight.position.y, this.sunlight.position.z);
        this.sunlightspot.position.set(this.sunlight.position.x + 10, this.sunlight.position.y, this.sunlight.position.z);
        this.hemisphere.position.set(this.sunlight.position.x, this.sunlight.position.y, this.sunlight.position.z)
        this.centerPointSunlight.add(this.sunlight);
        this.centerPointSunlight.add(this.sunlightspot);
        
        this.sunlight.castShadow = true;
        this.sunlight.receiveShadow = true;
        
        this.addToScene(this.centerPointSunlight);
        this.addToScene(this.hemisphere);
        this.addToScene(this.ambient);
    }

    checkSeason(){
        //season lerping
        var result = this.overallTimer;

        if( (result >= 0 && result < 45) || (result >= 315 && result < 360 ) ){
            console.log("sunrise");
            this.seasonNum = 3;
        }
        else if(result >= 45 && result < 135){
            console.log("morning");
            this.seasonNum = 0;
        }
        else if(result >= 135 && result < 225){
            console.log("sunset");
            this.seasonNum = 1;
        }
        else if(result >= 225 && result < 315){
            console.log("night");
            this.seasonNum = 2;
        }
        // if(this.overallTimer % 360 <= 90){
        //     console.log("morning");
        //     this.seasonNum = 0;
        // }
        // else if(this.overallTimer % 360 <= 180){
        //     this.seasonNum = 1;
        //     console.log("sunset");
        // }
        // else if(this.overallTimer % 360 <= 270){
        //     this.seasonNum = 2;
        //     console.log("night");
        // }
        // else if(this.overallTimer % 360 < 360){
        //     this.seasonNum = 3;
        //     console.log("sunrise");
        // }

        if(this.overallTimer > 360){
            this.overallTimer = 0;
        }
        if(this.seasonTimer >= 90){
            this.seasonTimer = 0;
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

    setCenterPointRotation(rotZ){
        this.centerPointSunlight.rotation.set(0,0,0); 
        this.centerPointSunlight.rotateZ(rotZ);
    }
    
    setSunlightIntensity(intensity){
        this.sunlight.intensity = intensity;
    }

    setSunlightColor(color){
        this.sunlight.color = color;
    }

    update(){
        var delta = this.clock.getDelta();
        this.seasonTimer += delta;
        this.overallTimer += delta;
        this.checkSeason();
        this.setSunlightTarget(GetShip());
        this.setCenterPoint(getShipPos());

        console.log(this.overallTimer);
        console.log(this.seasonTimer - 70);

        //Lerping colours
        var lerpVal = 0;
        var needsLerp = false;
        var nextIndex = 0;
        if(this.seasonTimer - 70 > 0){  
            if(this.seasonNum == this.prevSeasonNum){
                needsLerp = true;
                lerpVal = ( (this.seasonTimer - 70)/20 );
            }
            else{
                if( !(this.seasonTimer - 70 > 0) ){
                    this.prevSeasonNum = this.seasonNum;
                }
            }        
        }

        //getNextIndex
        nextIndex = (this.seasonNum + 1);
        if(nextIndex == 4){
            nextIndex = 0;
        }

        if(needsLerp){
            this.setSunlightColor( this.season[this.seasonNum][1].clone().lerp( this.season[nextIndex][1].clone() , lerpVal) );
        }
        else{
            this.setSunlightColor( this.season[this.seasonNum][1].clone() );
        }
        
        //garbage sun rotation
        this.setCenterPointRotation(THREE.Math.degToRad(this.overallTimer%360));
        
        //Finish this tomorrow
        //Implement the clock, and time the sunset, sunrise, morning and night,
        //Implement the lerp function for colours, by storing the colour in var
        //implement the clock functionality, by storing the time of day as a enumerator and store a var that checks if the season is at 70 seconds.
    }
}