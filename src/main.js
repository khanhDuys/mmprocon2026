import './style.css'
import javascriptLogo from './assets/javascript.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import * as THREE from 'three';
import { SceneSetup } from './Core/SceneSetup.js';
import { TitleScreen } from './Core/TitleScreen.js';
import { Sunflowers } from './World/Sunflowers.js';
import { Ground } from './World/Ground.js';
import { Sky } from './World/Sky.js';
import { Miku } from './World/Miku.js';
import { TitleBackground } from './World/TitleBackground.js';
import { TextAliveManager } from './Managers/TextAliveManager.js'
import { LyricManager } from './Managers/LyricManager.js'
import { UIManager } from './Managers/UIManager.js';
import { RhythmManager } from './Managers/RhythmManager.js';

import { PointerLockControls } from 'three/examples/jsm/Addons.js'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'

//Debug
import Stats from 'three/addons/libs/stats.module.js'
import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js';

import { compress } from 'three/examples/jsm/libs/fflate.module.js';

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

await document.fonts.ready; // wait for mona12 font
//const stats = new Stats();
//document.body.appendChild(stats.dom);
    document.documentElement.requestFullscreen();
// Initializaton
const core = new SceneSetup();
const controls = new PointerLockControls(core.camera, document.body); 
const audio = new TextAliveManager();
const lyric = new LyricManager(core.scene, 20);
const ui = new UIManager();
const rhythm = new RhythmManager(core.scene);
let lastLyricSprite = null;
let starsCollected = 0;
let starsSpawned = 0;
//const gui = new GUI();

let gameStarted = false;
 
const screenConfig = {
  title: {
    background: '/ui/title_bg.png',
    logo: { src: '/textures/logo.png', x: '5%', y: '25%', w: '20%' },
playButton: { text: "Start", x: '5%', y: '50%', fontSize: '60px' },
        creditsButton: { text: "Credits", x: '5%', y: '60%', fontSize: '60px' }
  },
  map: {
    background: '/textures/map.png',
    locations: [
      { src: '/textures/pin.png', x: '85%', y: '11%', w: '4%', songIndex: 0, name: "こたえて / imie" },
      { src: '/textures/pin.png', x: '72%', y: '20%', w: '4%', songIndex: 1, name: "アフター・ザ・カーテン / Rulmry" },
      { src: '/textures/pin.png', x: '83%', y: '35%', w: '4%', songIndex: 2, name: "シャッターチャンス / 夜未アガリ" },
      { src: '/textures/pin.png', x: '63%', y: '40%', w: '4%', songIndex: 3, name: "世界最後の音楽隊 / 夏山よつぎ×ど～ぱみん" },
      { src: '/textures/pin.png', x: '30%', y: '60%', w: '4%', songIndex: 4, name: "トリツクロジー / 鶴三" },
      { src: '/textures/pin.png', x: '44%', y: '70%', w: '4%', songIndex: 5, name: "TAKEOVER / Twinfield" }
    ]
  },
  credits: {
    background: '/textures/Credits.png'
  }
};
const title = new TitleScreen(screenConfig);
let titleBackground = null;
title.onTitleEnter = (canvas) => {
    titleBackground = new TitleBackground(canvas);
};
title.onTitleExit = () => {
    if (titleBackground) {
        titleBackground.dispose();
        titleBackground = null;
    }
};
title.onLocationSelected = (songIndex) => {
    gameStarted = true;
    audio.loadSong(songIndex);
    audio.player.addListener({
        onVideoReady: () => {
            title.hide(); 
            if (isMobile) {
            if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
            } else {
                controls.lock();
            }
            if (audio.isSongReady && !audio.player.isPlaying) {
                audio.player.requestPlay();
            }
            core.renderer.setAnimationLoop(animate);
        }
    });

};
audio.player.addListener({
    onAppReady: (app) => {
        if (!app.managed) {
            // TextAlive is ready, models are loading, swap to the Title Screen!
            title.show('title');
        }
    }
});
const params = {
  dot_camera: 0.75,
  dot_sunflower: 0.95,
  duration_weight: 0.01,
  title: false,
  offset_flower: 2,
  area_size: 180,
  max_dist: 50,
  cam_speed: 7,
};

//gui.add(params, 'dot_camera', 0.0, 1.0, 0.01);
//gui.add(params, 'dot_sunflower', 0.0, 1.0, 0.01);
//gui.add(params, 'duration_weight', 0.0, 0.05, 0.001);
//gui.add(params, 'offset_flower', 0.0, 2.0, 0.01);
//gui.add(params, 'area_size', 1, 200, 1);
//gui.add(params, 'max_dist', 1, 160, 1);
//gui.add(params, 'cam_speed', 0, 20, 0.01);


document.body.addEventListener('pointerdown', (e) => {
    if (!gameStarted) return;

    if (isMobile && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
    }

    if (!isMobile && !controls.isLocked) {
        controls.lock();
    }

    if (audio.isSongReady && !audio.player.isPlaying) {
        audio.player.requestPlay();
        return;
    } 
    
    if (audio.player.isPlaying && (isMobile || controls.isLocked)) {
        if (rhythm.tryHit(audio.player.timer.position)) { 
            starsCollected++;
            ui.setStars(starsCollected, starsSpawned);
        }
    }

    if (isMobile) {
        isDragging = true;
        previousPointer.x = e.clientX;
        previousPointer.y = e.clientY;
    }
});

let touchStartX = 0;
let touchStartY = 0;

document.body.addEventListener('touchstart', (e) => {
    if (!isMobile) return;
    touchStartX = e.touches[0].pageX;
    touchStartY = e.touches[0].pageY;
}, { passive: true });

document.body.addEventListener('touchmove', (e) => {
    if (!isMobile ) return;

    const deltaX = e.touches[0].pageX - touchStartX;
    const deltaY = e.touches[0].pageY - touchStartY;
    
    touchStartX = e.touches[0].pageX;
    touchStartY = e.touches[0].pageY;
    
    const euler = new THREE.Euler(0, 0, 0, 'YXZ');
    euler.setFromQuaternion(core.camera.quaternion);
    
    euler.y -= deltaX * 0.005; 
    euler.x -= deltaY * 0.005;
    
    euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x)); 
    
    core.camera.quaternion.setFromEuler(euler);
}, { passive: true });


//const fpsDiv = document.getElementById('fps-counter');
const ambient_light = new THREE.AmbientLight(0xffffff, 2.5);
core.scene.add(ambient_light);
//const spot_light = new THREE.SpotLight(0xffffff, 2);
//spot_light.castShadow = true;
//core.scene.add(spot_light);
const sunflower_field = new Sunflowers(core.scene, core.camera, 8000, params);
const ground = new Ground(core.scene);
const sky = new Sky(core.scene, params);
const miku = new Miku(core.scene);
//gui.add(sky.uniforms.uSharpness, 'value', 0.0, 1.0, 0.01).name('sharpness');
//gui.add(sky.uniforms.uExponent, 'value', 0., 50.0, 0.01).name('exponent');
//gui.add(sky.uniforms.uCloudScale,     'value', 1, 10, 0.1).name('cloud scale');
//gui.add(sky.uniforms.uCloudThreshold, 'value', 0, 1,  0.01).name('cloud density');
//gui.add(sky.uniforms.uCloudSmoothness, 'value', 0, 1,  0.01).name('cloud smoothness');
//gui.add(sky.uniforms.uSunGlow, 'value', 0, 1,  0.01).name('sun glow');
//gui.add(sky.uniforms.uSunSize, 'value', 0, 1,  0.01).name('sun size');
//gui.add(sky.uniforms.uBarHeight, 'value', 0, 1,  0.01).name('bar height');
//gui.add(sky.uniforms.uBarCount, 'value', 0, 100,  1.0).name('bar count');
//gui.add(sky.uniforms.uBarThickness, 'value', 0, 1.0,  0.01).name('bar thickness');
//gui.add(sky.uniforms.uBarRevolutions, 'value', 0, 40.0,  1.0).name('bar revolutions');
//gui.add(sky.uniforms.uBarSpeed, 'value', 0, 5.0,  0.01).name('bar revolution speed');
//gui.add(sky.uniforms.uRevolutionWeight, 'value', 0, 1.0,  0.01).name('bar revolution weight');
//gui.add(sky.uniforms.uPixelSize, 'value', 0, 40.0,  1.0).name('pixel size');
//gui.add(sky.uniforms.uDitherBands, 'value', 0, 30.0,  0.01).name('dither bands');
//gui.add(sky.uniforms.uCloudDitherScale, 'value', 0, 300.0,  1.0).name('cloud dither size');
//gui.add(sky.uniforms.uDitherOffset.value, 'x', -8, 8, 1).name('dither offset x');
//gui.add(sky.uniforms.uDitherOffset.value, 'y', -8, 8, 1).name('dither offset y');
const timer = new THREE.Timer();

audio.onLyricUpdate = (word, cur_char) => {
    const lyric_data = lyric.updateAndGetLyrics(word, cur_char);
    sunflower_field.placeLyric(lyric_data);
    lastLyricSprite = lyric_data.sprite;
};  

audio.onStarSpawn = (word) => {
    starsSpawned++;
    ui.setStars(starsCollected, starsSpawned);
    rhythm.spawn(lastLyricSprite, word.starSpawnTime, word.endTime);
};

audio.onBeatUpdate = () => {
  sky.uniforms.uSinceLastBeat.value = 0.0;
  sky.uniforms.uCurBPM.value = audio.getBPM();
  sky.uniforms.uBeatDuration.value = audio.getBeatDuration() * 0.001;
  console.log("beat");
}

let last_update = 0;
let frame_count = 0;

function animate(timestamp) {

  timer.update(timestamp);
  const deltaTime = timer.getDelta();

  frame_count++;
  //stats.update(); 

  sunflower_field.update(core.camera, deltaTime, audio.player.timer.position);
  rhythm.update(audio.player.timer.position, deltaTime, core.camera);
  
  //spot_light.position.set = core.camera.position;
  //spot_light.position.z += 1;
  //spot_light.position.y += 3;
  core.camera.position.z += params.cam_speed*deltaTime;
  ground.update(core.camera);
  let ratio = 0;
  if (audio.player.video) ratio=audio.player.timer.position/audio.player.video.duration;
  sky.update(core.camera, deltaTime, audio.getBPM(), ratio);
  if (miku) miku.update(deltaTime, core.camera, false);
  core.scene.fog.color.copy(sky.uniforms.uBottomColor.value); // copy fog color
  //fpsDiv.innerText = `FPS: ${Math.round(1/deltaTime)}`; // formula for calculating fps is 1/deltatime (deltatime is in seconds)
  //if (timestamp>last_update+500) { // average of 500ms
  //  //console.log((timestamp-last_update));
  //  fpsDiv.innerText = `FPS: ${Math.round( (frame_count*1000)/(timestamp-last_update) )}`;
  //  last_update = timestamp; frame_count = 0;
  //}
  core.camera.position.y = 9 + Math.sin(timestamp * 0.008) * 0.1;


  if (audio.player.video) ui.draw(audio.player.timer.position, audio.player.video.duration);
  core.composer.render(core.scene, core.camera);
}
