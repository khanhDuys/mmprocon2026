import * as THREE from 'three';
import vertexShader from'../Shaders/sky/vertex.glsl'
import fragmentShader from'../Shaders/sky/fragment.glsl'



export class Sky {
    constructor(scene, params) {
        this.params = params;
        this.uniforms = {
            uExponent: { value: 4.5 },
            uSharpness: { value: 0.2 },
            uTopColor: { value: new THREE.Color(0x7ac7eb) },
            uBottomColor: { value: new THREE.Color(0xb5ffff) }
        }
        this.sky = null;
        this.scene = scene;
        this.init();
    }
    init() {
        const geo = new THREE.SphereGeometry(500, 16, 8);
        const mat = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader,
            fragmentShader, 
            side: THREE.BackSide
        })
        this.sky = new THREE.Mesh(geo, mat);
        this.scene.add(this.sky);
    }
    update(camera) {
        this.sky.position.copy(camera.position);
    }
}