import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass, BloomPass, FXAAPass, OutputPass, SSAOPass } from 'three/examples/jsm/Addons.js';
export class SceneSetup {
    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color('lightblue');
        this.scene.fog = new THREE.Fog('lightblue', 50, 60);


        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 0, 0);
        this.camera.rotation.y = -Math.PI;

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        //this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);

        this.composer = new EffectComposer(this.renderer);

        this.renderPass = new RenderPass( this.scene, this.camera );
        this.composer.addPass( this.renderPass );
        //this.fxaaPass = new FXAAPass();
        //this.composer.addPass( this.fxaaPass );
        this.outputPass = new OutputPass()
        this.composer.addPass( this.outputPass );
        
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth/window.innerHeight;
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.camera.updateProjectionMatrix();
        });
    }
}