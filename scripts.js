var scene = new THREE.Scene();

const clock = new THREE.Clock();

var Pos = new THREE.Vector3(0,0,0);
var Dir = new THREE.Vector3(0,0,1);

var ship = new THREE.Mesh();

var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.z = 10;

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;

var keyLight = new THREE.DirectionalLight(new THREE.Color('hsl(30, 100%, 75%)'), 1.0);
keyLight.position.set(0, 0, 0);

var fillLight = new THREE.DirectionalLight(new THREE.Color('hsl(240, 100%, 75%)'), 0.75);
fillLight.position.set(0, 0, 0);

var backLight = new THREE.DirectionalLight(0xffffff, 1.0);
backLight.position.set(0, 0, 0).normalize();

// var camLight = new THREE.PointLight(new THREE.Color(1,1,1), 1000, 2000);
// camLight.position.set(10,10,0);
// camera.add(camLight);
// scene.add(camera);

var pointLight = new THREE.SpotLight(new THREE.Color(1,1,1), 1,100);
pointLight.position.set(0,20,0);
scene.add(pointLight);

scene.add(keyLight);
scene.add(fillLight);
scene.add(backLight);

var geometry = new THREE.BoxGeometry( 1, 1, 1 );
var material = new THREE.MeshBasicMaterial( {color: 0x777777} );
var cube = new THREE.Mesh( geometry, material );

cube.position.set(0,-5,0);
cube.scale.set(100,0.1,100);

scene.add( cube );

var mtlLoader = new THREE.MTLLoader();
mtlLoader.setTexturePath('/textures/');
mtlLoader.setPath('/models/');
mtlLoader.load('viper2.mtl', function (materials) {

    materials.preload();

    var objLoader = new THREE.OBJLoader();
    objLoader.setMaterials(materials);
    //objLoader.setPath('/models/');
    //objLoader.load('viper.obj', function (object) {
    objLoader.load('models/viper2.obj', function (object) {

        // object.position.y = 0;
        // object.position.y = 0;
        // object.position.z = 0;
        //camera.add(object);
        ship = object;
        scene.add(ship);
        //object.position.y -= 60;

    });

});

var animate = function () {
	requestAnimationFrame( animate );
	controls.update();
  shipControls();
	renderer.render(scene, camera);
};

var moveForward=false;
var moveLeft=false;
var moveBackward=false;
var moveRight=false;

var speed=6;
var angle=0;

function shipControls(){
  var delta = clock.getDelta();

  if (moveLeft==true)
  {
    angle+=speed*delta;
    Dir.x=Math.sin(angle);
    Dir.z=Math.cos(angle);
    Dir.normalize();
  }
  if (moveRight==true)
  {
    angle-=speed*delta;
    Dir.x=Math.sin(angle);
    Dir.z=Math.cos(angle);
    Dir.normalize();
  }
  if (moveForward==true)
  {
    Pos.x+=Dir.x*speed*delta;
    //Pos.y+=Dir.y*speed*delta;
    Pos.z+=Dir.z*speed*delta;
  }
  if (moveBackward==true)
  {
    Pos.x-=Dir.x*speed*delta;
    //Pos.y-=Dir.y*speed*delta;
    Pos.z-=Dir.z*speed*delta;
  }

  ship.position.set(Pos.x,Pos.y,Pos.z);
  ship.rotation.set(Pos.x+Dir.x,Pos.y+Dir.y,Pos.z+Dir.z);

  controls.target = new THREE.Vector3(Pos.x,Pos.y,Pos.z);

  //camera.position.set(Pos.x+10,Pos.y+10,Pos.z+10);
  //camera.lookAt(ship);

}

var onKeyDown = function ( event ) {

  switch ( event.keyCode ) {

    case 87: // w
      moveForward = true;
      break;

    case 65: // a
      moveLeft = true;
      break;

    case 83: // s
      moveBackward = true;
      break;

    case 68: // d
      moveRight = true;
      break;

  }

};

var onKeyUp = function ( event ) {

  switch( event.keyCode ) {

    case 87: // w
      moveForward = false;
      break;

    case 65: // a
      moveLeft = false;
      break;

    case 83: // s
      moveBackward = false;
      break;

    case 68: // d
      moveRight = false;
      break;

  }
};

document.addEventListener( 'keydown', onKeyDown, false );
document.addEventListener( 'keyup', onKeyUp, false );

animate();
