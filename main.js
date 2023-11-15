import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js";
function refreshPage() {
  location.reload();
}
import { PointerLockControls } from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/PointerLockControls.js";
const gravity = 0.01;
let velocityY = 0;
let isJumping = false;
const jumpStrength = 0.5;
let camera, scene, renderer, controls, capsule;
const objects = [];
let raycaster;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = true;
let cameraMoveSpeed = 1;
let prevTime = performance.now();
const velocity = new THREE.Vector3();

function init() {
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.set(0, 74.09897435791945, 52.927838827085445);
  scene = new THREE.Scene();
  scene.background = new THREE.Color("grey");
  const light = new THREE.DirectionalLight(0xffffff, 0.5);
  light.position.set(0.5, 1, 0.75);
  scene.add(light);
  controls = new PointerLockControls(camera, document.body);

  const blocker = document.getElementById("blocker");
  const instructions = document.getElementById("instructions");
  instructions.addEventListener("click", function () {
    controls.lock();
  });

  controls.addEventListener("lock", function () {
    instructions.style.display = "none";
    blocker.style.display = "none";
  });

  controls.addEventListener("unlock", function () {
    blocker.style.display = "block";
    instructions.style.display = "";
  });
  scene.add(controls.getObject());

  const onKeyDown = function (event) {
    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        moveForward = true;
        break;

      case "ArrowLeft":
      case "KeyA":
        moveRight = true;
        break;

      case "ArrowDown":
      case "KeyS":
        moveBackward = true;
        break;

      case "ArrowRight":
      case "KeyD":
        moveLeft = true;
        break;
      case "KeyR":
        refreshPage();
        break;
      case "Space":
        console.log("Space key pressed");
        if (!isJumping) {
          isJumping = true;
          velocityY = jumpStrength;
        }
        break;
    }
  };

  const onKeyUp = function (event) {
    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        moveForward = false;
        break;

      case "ArrowLeft":
      case "KeyA":
        moveRight = false;
        break;

      case "ArrowDown":
      case "KeyS":
        moveBackward = false;
        break;

      case "ArrowRight":
      case "KeyD":
        moveLeft = false;
        break;

      case "Space":
        if (velocityY > 0) {
          velocityY = velocityY * 0.5;
        }
    }
  };

  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);
  raycaster = new THREE.Raycaster(
    new THREE.Vector3(),
    new THREE.Vector3(0, -1, 0),
    0,
    10
  );
  const capsuleGeo = new THREE.CapsuleGeometry(1, 2, 10, 30);
  const capsuleMat = new THREE.MeshStandardMaterial({ color: "blue" });
  capsule = new THREE.Mesh(capsuleGeo, capsuleMat);
  scene.add(capsule);
  capsule.position.y = 3;

  let floorGeometry = new THREE.BoxGeometry(100,100);
  
  floorGeometry.rotateX(-Math.PI / 2);
  const floorMaterial = new THREE.MeshStandardMaterial({ color: "silver" });

  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  scene.add(floor);
  floor.position.y = -2;
}

renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener("resize", onWindowResize);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}
cameraMoveSpeed = 1;

function update() {
  if (isJumping) {
    camera.position.y += velocityY;
    velocityY -= gravity;

    if (camera.position.y <= 0) {
      camera.position.y = 0;
      isJumping = false;
      velocityY = 0;
    }
  }
}
function animate() {
  requestAnimationFrame(animate);
  const time = performance.now();
  const delta = (time - prevTime) / 1000;

  if (controls.isLocked === true) {
    capsule.position.copy(camera.position);
    const cameraDirection = new THREE.Vector3(0, 0, -1);
    cameraDirection.applyQuaternion(camera.quaternion);
    const cameraRotation = new THREE.Euler(0, 0, 0, "YXZ");
    cameraRotation.setFromQuaternion(camera.quaternion);

    const moveDirection = new THREE.Vector3();

    if (moveForward) {
      moveDirection.add(cameraDirection);
    }
    if (moveBackward) {
      moveDirection.sub(cameraDirection);
    }
    if (moveLeft) {
      const cameraRotation = cameraDirection
        .clone()
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
      moveDirection.add(cameraRotation);
    }
    if (moveRight) {
      const cameraRotation = cameraDirection
        .clone()
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
      moveDirection.add(cameraRotation);
    }

    moveDirection.normalize();
    moveDirection.multiplyScalar(cameraMoveSpeed);

    capsule.translateX(moveDirection.x);
    capsule.translateZ(moveDirection.z);

    raycaster.ray.origin.copy(controls.getObject().position);
    raycaster.ray.origin.y -= 10;

    const intersections = raycaster.intersectObjects(objects, false);
    const onObject = intersections.length > 0;

    if (onObject === true) {
      velocity.y = Math.max(0, velocity.y);
      canJump = true;
    }

    controls.getObject().position.y += velocity.y * delta;

    if (controls.getObject().position.y < 10) {
      velocity.y = 0;
      controls.getObject().position.y = 10;
      canJump = true;
    }
  }

  prevTime = time;

  camera.position.lerp(capsule.position, cameraMoveSpeed);
  raycaster.ray.origin.copy(controls.getObject().position);
  raycaster.ray.origin.y -= 10;

  renderer.render(scene, camera);
  onWindowResize();
  update();
}
init();
animate();
