import './style.css'
import javascriptLogo from './assets/javascript.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import { setupCounter } from './counter.js'

import { SceneSetup } from './Core/SceneSetup.js';
import { Sunflower } from './World/Sunflower.js';
import { PointerLockControls } from 'three/examples/jsm/Addons.js'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'
import { Timer } from 'three'

import * as THREE from 'three';
import { abs, instance } from 'three/tsl'


const core = new SceneSetup();
const controls = new PointerLockControls(core.camera, core.renderer.domElement);
document.body.addEventListener('click', () => {
    controls.lock();
});

const ambient_light = new THREE.AmbientLight(0xffffff, 2);
core.scene.add(ambient_light);

const sunflower_field = new Sunflower(core.scene);
const timer = new THREE.Timer();
function animate(timestamp) {

  timer.update(timestamp);
  const deltaTime = timer.getDelta();

  sunflower_field.update(core.camera);
  
  core.camera.position.z -= 0.5*deltaTime;
  core.camera.position.y = 0.7+Math.sin(timestamp*0.008)*0.01;
  controls.update();

  core.renderer.render(core.scene, core.camera);
}

core.renderer.setAnimationLoop(animate);