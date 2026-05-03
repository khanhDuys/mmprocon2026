import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { thickness } from 'three/tsl';
export class Sunflower {
    constructor(scene) {
        this.scene = scene;
        this.flower_count = 2000;
        this.area_size = 25;

        this.temp = new THREE.Object3D();
        this.instance_position = new THREE.Vector3();
        this.instance_sunflowers = null;
        this.instance_scale = 0.01;
        this.init();
    }

    init() {
        const loader = new GLTFLoader();
        loader.load('/models/Sunflower.glb', (gltf) => {
            let flower_geo = null;
            let flower_mat = null;
        
        
            gltf.scene.traverse((child) => { // loop through children
            if (child.isMesh&&!flower_geo) { // if is flower mesh
                flower_mat = child.material;
                flower_geo = child.geometry;
                flower_mat.side = THREE.DoubleSide;
                flower_mat.transparent = true;
                flower_mat.alphaTest = 0.5;
                flower_mat.depthWrite = true; // force three.js to calc depth
              }
            })
            this.instance_sunflower = new THREE.InstancedMesh(flower_geo, flower_mat, this.flower_count);
            for (let i = 0; i<this.flower_count; i++) {
              const x = this.area_size*(Math.random()-0.5);
              const z = this.area_size*(Math.random()-0.5);
              this.temp.position.set(x, 0, z);
              const rot = (Math.random()-0.5)*Math.PI*0.5;
              this.temp.rotation.y = rot;
              this.temp.scale.set(this.instance_scale, this.instance_scale, this.instance_scale);
              this.temp.updateMatrix();
              this.instance_sunflower.setMatrixAt(i, this.temp.matrix);
            }
            
            this.scene.add(this.instance_sunflower);
          }
        );
    }
    
    update(camera) {
        if (!this.instance_sunflower) return;
        
        let needUpdate = false;
        for (let i = 0; i<this.flower_count; i++) {
            this.instance_sunflower.getMatrixAt(i, this.temp.matrix);
            this.instance_position.setFromMatrixPosition(this.temp.matrix);
            let x = this.instance_position.x;
            let z = this.instance_position.z;
            let dx = x-camera.position.x;
            let dz = z-camera.position.z;
            let shiftX = Math.round(dx / this.area_size); // if distance is > half of area size
            let shiftZ = Math.round(dz / this.area_size);      
            if (shiftX !== 0 || shiftZ !== 0){
              x -= shiftX * this.area_size;
              z -= shiftZ * this.area_size;
              this.temp.position.set(x, 0, z);
              const rot = (Math.random()-0.5)*Math.PI*0.5;
              this.temp.rotation.y = rot;
              this.temp.scale.set(this.instance_scale, this.instance_scale, this.instance_scale);
              this.temp.updateMatrix();
              this.instance_sunflower.setMatrixAt(i, this.temp.matrix);
              needUpdate=true;
            }
        }

        if (needUpdate) {
            this.instance_sunflower.instanceMatrix.needsUpdate = true;
        }
    }
}