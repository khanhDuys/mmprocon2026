import './style.css'
import javascriptLogo from './assets/javascript.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import * as THREE from 'three';
import { SceneSetup } from './Core/SceneSetup.js';

import { Sunflowers } from './World/Sunflowers.js';
import { Ground } from './World/Ground.js';
import { Sky } from './World/Sky.js';

import { TextAliveManager } from './Managers/TextAliveManager.js'
import { LyricManager } from './Managers/LyricManager.js'

import { PointerLockControls } from 'three/examples/jsm/Addons.js'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'

//Debug
import Stats from 'three/addons/libs/stats.module.js'
import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js';

import { compress } from 'three/examples/jsm/libs/fflate.module.js';
import { RhythmManager } from './Managers/RhythmManager.js';
await document.fonts.ready; // wait for mona12 font
const stats = new Stats();
document.body.appendChild(stats.dom);
// Initializaton
const core = new SceneSetup();
const controls = new PointerLockControls(core.camera, document.body); 
const audio = new TextAliveManager();
const lyric = new LyricManager(core.scene, 20);
const rhythm = new RhythmManager(audio);
const gui = new GUI();

const params = {
  dot_camera: 0.75,
  dot_sunflower: 0.95,
  duration_weight: 0.01,
  offset_flower: 2,
  area_size: 210,
  max_dist: 50,
  cam_speed: 7,
};

gui.add(params, 'dot_camera', 0.0, 1.0, 0.01);
gui.add(params, 'dot_sunflower', 0.0, 1.0, 0.01);
gui.add(params, 'duration_weight', 0.0, 0.05, 0.001);
gui.add(params, 'offset_flower', 0.0, 2.0, 0.01);
gui.add(params, 'area_size', 1, 200, 1);
gui.add(params, 'max_dist', 1, 160, 1);
gui.add(params, 'cam_speed', 0, 20, 0.01);


document.body.addEventListener('click', () => {
    if (!controls.isLocked) {
        controls.lock();
    }
});
//const fpsDiv = document.getElementById('fps-counter');
const ambient_light = new THREE.AmbientLight(0xffffff, 2);
core.scene.add(ambient_light);
//const spot_light = new THREE.SpotLight(0xffffff, 2);
//spot_light.castShadow = true;
//core.scene.add(spot_light);
const sunflower_field = new Sunflowers(core.scene, core.camera, 10000, params);
const ground = new Ground(core.scene);
const sky = new Sky(core.scene, params);

gui.add(sky.uniforms.uSharpness, 'value', 0.0, 1.0, 0.01).name('sharpness');
gui.add(sky.uniforms.uExponent, 'value', 0., 50.0, 0.01).name('exponent');
gui.add(sky.uniforms.uCloudScale,     'value', 1, 10, 0.1).name('cloud scale');
gui.add(sky.uniforms.uCloudThreshold, 'value', 0, 1,  0.01).name('cloud density');
gui.add(sky.uniforms.uCloudSmoothness, 'value', 0, 1,  0.01).name('cloud smoothness');
gui.add(sky.uniforms.uSunGlow, 'value', 0, 1,  0.01).name('sun glow');
gui.add(sky.uniforms.uSunSize, 'value', 0, 1,  0.01).name('sun size');
gui.add(sky.uniforms.uBarHeight, 'value', 0, 1,  0.01).name('bar height');
gui.add(sky.uniforms.uBarCount, 'value', 0, 100,  1.0).name('bar count');
gui.add(sky.uniforms.uBarThickness, 'value', 0, 1.0,  0.01).name('bar thickness');
gui.add(sky.uniforms.uBarRevolutions, 'value', 0, 40.0,  1.0).name('bar revolutions');
gui.add(sky.uniforms.uBarSpeed, 'value', 0, 5.0,  0.01).name('bar revolution speed');
gui.add(sky.uniforms.uRevolutionWeight, 'value', 0, 1.0,  0.01).name('bar revolution weight');


const timer = new THREE.Timer();

audio.onLyricUpdate = (word, cur_char) => {
    const lyric_data = lyric.updateAndGetLyrics(word, cur_char);
    sunflower_field.placeLyric(lyric_data);
};

audio.onBeatUpdate = () => {
  sky.uniforms.uSinceLastBeat.value = 0.0;
  sky.uniforms.uCurBPM.value = audio.getBPM();
  sky.uniforms.uBeatDuration.value = audio.getBeatDuration() * 0.001;
  console.log("beat");
}

let last_update = 0; // for fps calculation
let frame_count = 0;

function animate(timestamp) {

  timer.update(timestamp);
  const deltaTime = timer.getDelta();

  frame_count++;
  stats.update(); 

  sunflower_field.update(core.camera, deltaTime);
  
  //spot_light.position.set = core.camera.position;
  //spot_light.position.z += 1;
  //spot_light.position.y += 3;
  core.camera.position.z += params.cam_speed*deltaTime;
  ground.update(core.camera);
  sky.update(core.camera, deltaTime);
  core.scene.fog.color.copy(sky.uniforms.uBottomColor.value); // copy fog color
  //fpsDiv.innerText = `FPS: ${Math.round(1/deltaTime)}`; // formula for calculating fps is 1/deltatime (deltatime is in seconds)
  //if (timestamp>last_update+500) { // average of 500ms
  //  //console.log((timestamp-last_update));
  //  fpsDiv.innerText = `FPS: ${Math.round( (frame_count*1000)/(timestamp-last_update) )}`;
  //  last_update = timestamp; frame_count = 0;
  //}
  core.camera.position.y = 9 + Math.sin(timestamp * 0.008) * 0.1;

  if (audio.isSongReady && !audio.player.isPlaying) {
    audio.player.requestPlay();
  }

  core.composer.render(core.scene, core.camera);
}
core.renderer.setAnimationLoop(animate);