import './style.css'
import javascriptLogo from './assets/javascript.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import { setupCounter } from './counter.js'

import { SceneSetup } from './Core/SceneSetup.js';
import { Sunflowers } from './World/Sunflowers.js';
import { TextAliveManager } from './Managers/TextAliveManager.js'
import { LyricManager } from './Managers/LyricManager.js'
import { PointerLockControls } from 'three/examples/jsm/Addons.js'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'

import * as THREE from 'three';

await document.fonts.ready; // wait for mona12 font
// Initializaton
const core = new SceneSetup();
const controls = new PointerLockControls(core.camera, document.body); 
const audio = new TextAliveManager();
const lyric = new LyricManager(core.scene, 20);


document.body.addEventListener('click', () => {
    if (!controls.isLocked) {
        controls.lock();
    }
});

const fpsDiv = document.getElementById('fps-counter');

const ambient_light = new THREE.AmbientLight(0xffffff, 2);
core.scene.add(ambient_light);

const sunflower_field = new Sunflowers(core.scene, core.camera, 1500);
const timer = new THREE.Timer();

audio.onLyricUpdate = (word, cur_char) => {
    const lyric_data = lyric.updateAndGetLyrics(word, cur_char);
    sunflower_field.placeLyric(lyric_data);
};

function animate(timestamp) {
  timer.update(timestamp);
  const deltaTime = timer.getDelta();

  sunflower_field.update(core.camera);
  
  core.camera.position.z += 5*deltaTime;
  fpsDiv.innerText = `FPS: ${Math.round(1/deltaTime)}`; // formula for calculating fps is 1/deltatime (deltatime is in seconds)
  core.camera.position.y = 7 + Math.sin(timestamp * 0.008) * 0.1;
  console.log(timestamp);
  if (audio.isSongReady && !audio.player.isPlaying) {
    audio.player.requestPlay();
  }

  core.renderer.render(core.scene, core.camera);
}

core.renderer.setAnimationLoop(animate);