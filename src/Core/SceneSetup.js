import * as THREE from 'three';

export class SceneSetup {
    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color('lightblue');
        this.scene.fog = new THREE.Fog('lightblue', 8, 10);


        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 100);
        this.camera.position.set(0, 0, 0);
        
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth/window.innerHeight;
            this.camera.updateProjectionMatrix();
        });
    }
}