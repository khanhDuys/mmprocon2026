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
            uBottomColor: { value: new THREE.Color(0xb5ffff) },
            uTime: { value: 0 },
            uCloudScale: { value: 3.0 },
            uCloudThreshold: { value: 0.2 },
            uCloudSmoothness: { value: 0.5}, 
            uCloudColor: { value: new THREE.Color(0xffffff) },
            uSunSize: { value: 0.001 },
            uSunGlow: { value: 0.5 },
            uSunDirection: { value: new THREE.Vector3(0.0, 0.2, 1.0) },
            uSunColor: { value: new THREE.Color(0xfffdf5) },
            uBarHeight: { value : 0.08 },
            uBarCount: { value : 75.0 },
            uBarThickness: { value: 0.6 },
            uBarRevolutions: { value: 5 },
            uBarSpeed: { value: 1.35},
            uRevolutionWeight: { value: 0.05 },
            uBarColor: { value: new THREE.Color(0xffffff) },
            uSinceLastBeat: { value: 10000.0 },
            uBeatDuration: { value: 0.0 },
            uCurBPM: { value: 0.0 },
            uBPMCount: { value : 0.0 }
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
    update(camera, deltaTime, BPM) {
        this.sky.position.copy(camera.position);
        this.uniforms.uTime.value += deltaTime;
        this.uniforms.uBPMCount.value += BPM;
        console.log(this.uniforms.uBPMCount.value);
        this.uniforms.uSinceLastBeat.value += deltaTime;
        //console.log(this.uniforms.uSinceLastBeat.value + this.uniforms.uBeatDuration.value);
    }
}