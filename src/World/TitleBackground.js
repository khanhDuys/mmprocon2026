import * as THREE from 'three';
import { Sky } from '../World/Sky.js';
import { Miku } from '../World/Miku.js';
import { Ground } from './Ground.js';
import { Sunflowers } from './Sunflowers.js';
export class TitleBackground {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(-10, 10, 15);
        this.renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        //this.mesh = new THREE.Mesh(
        //    new THREE.TorusKnotGeometry(1, 0.3, 100, 16),
        //    new THREE.MeshNormalMaterial()
        //);
        this.scene.add(this.mesh);
        //const params = {};
        this.sky = new Sky(this.scene);
        this.ground = new Ground(this.scene);
        this.miku = new Miku(this.scene);
        this.timer = new THREE.Timer();
        this.camera.lookAt(new THREE.Vector3(0, 5, 0));
        const ambient_light = new THREE.AmbientLight(0xffffff, 3.0);
        this.scene.add(ambient_light);
        this.scene.fog = new THREE.Fog(new THREE.Color(0x61F3F3), 80, 200);
        this.ground.ground.position.y+=2.6;
        const params = {
  dot_camera: 0.75,
  dot_sunflower: 0.95,
  duration_weight: 0.01,
  title: true,
  offset_flower: 2,
  area_size: 150,
  max_dist: 50,
  cam_speed: 7,
};
        this.sunflower = new Sunflowers(this.scene, this.camera, 600, params);
        this.resize = this.resize.bind(this);
        window.addEventListener('resize', this.resize);
        this.renderer.setAnimationLoop((t) => this.render(t));
    }

    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render(t) {
        //this.mesh.rotation.y = t * 0.0005;
        //this.mesh.rotation.x = t * 0.0003;
        this.timer.update(t);
        const deltaTime = this.timer.getDelta();
        this.sky.position = this.camera.position;
        this.sky.update(this.camera, deltaTime, 0, 0);
        this.miku.update(deltaTime, this.camera, true);
        if (this.miku.miku) this.miku.miku.position.z+=5*deltaTime;
        this.camera.position.z+=5*deltaTime;
        this.ground.update(this.camera);
        this.renderer.render(this.scene, this.camera);
    }

    dispose() {
        this.renderer.setAnimationLoop(null);
        window.removeEventListener('resize', this.resize);
        this.renderer.dispose();
    }
}