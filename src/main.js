import './style.css'
import javascriptLogo from './assets/javascript.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import { setupCounter } from './counter.js'

import { SceneSetup } from './Core/SceneSetup.js';
import { Sunflowers } from './World/Sunflowers.js';
//import { TextAliveManager } from './Managers/TextAliveManager.js'
import { PointerLockControls } from 'three/examples/jsm/Addons.js'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'

import * as THREE from 'three';

const core = new SceneSetup();
const controls = new PointerLockControls(core.camera, document.body); 
//const audio = new TextAliveManager();

document.body.addEventListener('click', () => {
    if (!controls.isLocked) {
        controls.lock();
    }
});

const ambient_light = new THREE.AmbientLight(0xffffff, 2);
core.scene.add(ambient_light);

const sunflower_field = new Sunflowers(core.scene);
const timer = new THREE.Timer();

function animate(timestamp) {
  timer.update(timestamp);
  const deltaTime = timer.getDelta();

  sunflower_field.update(core.camera);
  
  core.camera.position.z -= 0.5*deltaTime;
  console.log(core.camera.position.z);
  core.camera.position.y = 0.7 + Math.sin(timestamp * 0.008) * 0.01;

  //if (audio.isSongReady && !audio.player.isPlaying) {
  //  audio.player.requestPlay();
  //}

  core.renderer.render(core.scene, core.camera);
}

core.renderer.setAnimationLoop(animate);