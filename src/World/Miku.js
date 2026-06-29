import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

export class Miku {
    constructor(scene) {
        this.scene = scene;
        this.mixer = null;
        this.miku = null;
        this.init();
    }

    init() {
        const texture = new THREE.TextureLoader().load('/textures/testface.png');
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = texture.magFilter = THREE.NearestFilter;
        texture.flipY = false;
        const loader = new GLTFLoader();
        loader.load('/models/miku.glb', (gltf) => {
            this.mixer = new THREE.AnimationMixer(gltf.scene);
            
            if (gltf.animations.length) {
                this.mixer.clipAction(gltf.animations[2]).play();
            }
        gltf.scene.traverse((node) => {
                if (node.isMesh || node.isSkinnedMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                    node.frustumCulled = false;

                    if (node.material) {
                        if (node.material.map) {
                            node.material.map.minFilter = THREE.NearestFilter;
                            node.material.map.magFilter = THREE.NearestFilter;
                        }

                        node.material.side = THREE.DoubleSide;

                        node.material.transparent = false; 
                        
                        node.material.depthWrite = true;   
                        
                        node.material.alphaTest = 0.1;     
                    }
                }
            });

            this.miku = gltf.scene; 
            
            this.miku.position.set(0, 0, 0); 
            
            this.miku.scale.set(8, 8, 8);
            this.scene.add(this.miku);
        });
    }

    update(deltaTime, camera, staticFlag) {
        if(this.miku&&!staticFlag) {
            this.miku.position.copy(camera.position);
            this.miku.position.y=0;
            this.miku.position.z+=15;
            this.miku.position.x+=5;
        }
        if (this.mixer) this.mixer.update(deltaTime);
    }
}