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
            uHorizonColor: { value: new THREE.Color(0xff7e4d) },
            uSunsetColor: { value: new THREE.Color(0x99220b) },
            uTime: { value: 0 },
            uCloudScale: { value: 1.5 },
            uCloudThreshold: { value: 0.03 },
            uCloudSmoothness: { value: 0.35}, 
            uCloudColor: { value: new THREE.Color(0xffffff) },
            uDarkCloudColor: { value: new THREE.Color(0x6a3773) },
            uSunSize: { value: 0.001 },
            uSunGlow: { value: 0.5 },
            uSunDirection: { value: new THREE.Vector3(0.0, 0.01, 1.0) },
            uSunColor: { value: new THREE.Color(0xfffdf5) },
            uSunSunsetColor: { value: new THREE.Color(0xffefba) },
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
            uBPMCount: { value : 0.0 },
            // dithering / pixelation
            uPixelSize: { value: 3.0 },
            uCloudDitherScale: { value: 40.0 },
            uDitherBands: { value: 10.5 },
            uDitherOffset: { value: new THREE.Vector2(1.0, 0.0) }
        }
        this.sky = null;
        this.scene = scene;
        this.daySpeed = 0.05; // radians/sec
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
    update(camera, deltaTime, BPM, ratio) {
        this.sky.position.copy(camera.position);
        this.uniforms.uTime.value += deltaTime; 
        this.uniforms.uBPMCount.value += BPM;
        //console.log(this.uniforms.uBPMCount.value);
        this.uniforms.uSinceLastBeat.value += deltaTime;
        const sunAngle = 0.4-0.4*ratio;
        console.log(ratio);
        this.uniforms.uSunDirection.value.set(0.0, Math.sin(sunAngle), Math.cos(sunAngle));
        //console.log(this.uniforms.uSinceLastBeat.value + this.uniforms.uBeatDuration.value);
    }
}