let scene, camera, renderer, cube;

var cubeSize = 3;
var cubeSpeed = 1;
var clock = new THREE.Clock();
var delta;

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    75,                                           //fov - field of view
    window.innerWidth / window.innerHeight,       //aspect - aspect ratio
    0.1,                                          //near clipping plane
    1000                                          //far clipping plane
  );

  renderer = new THREE.WebGLRenderer({antialias: true});

  renderer.setSize(window.innerWidth, window.innerHeight);

  document.body.appendChild(renderer.domElement);

  const geometry = new THREE.BoxGeometry( cubeSize, cubeSize, cubeSize );
  //const material = new THREE.MeshBasicMaterial( {color: 0x0000ff} );

  const texture = new THREE.TextureLoader().load('textures/box.png');
  const material = new THREE.MeshBasicMaterial( {map: texture } );
  cube = new THREE.Mesh( geometry, material );
  scene.add( cube );

  camera.position.z = 5;
}

function animate(){
  requestAnimationFrame(animate);

  delta = clock.getDelta();

  cube.rotation.y += cubeSpeed * delta;

  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);

init();
animate();
