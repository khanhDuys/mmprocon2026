import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { texture, thickness } from 'three/tsl';
import { SpriteMaterial } from 'three/webgpu';
export class Sunflowers {
    constructor(scene, camera, count) {
        this.scene = scene;
        this.camera = camera;
        this.flower_count = count;
        this.area_size = 120;

        this.temp = new THREE.Object3D(); // dummy for position randomizing
        this.instance_position = new THREE.Vector3();
        this.instance_sunflower = null;
        this.instance_scale = 0.1;
        // for lyric pool
        this.pool_assigned = new Map();       
        this.used_sunflowers = new Set();

        // pre-allocated math for no garbage collection
        this.temp_matrix = new THREE.Matrix4();
        this.temp_position = new THREE.Vector3();
        this.to_sunflower = new THREE.Vector3();
        this.camera_direction = new THREE.Vector3(); 
        this.offset_pos = new THREE.Vector3();
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
                flower_geo.computeBoundingSphere();
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
              const rot = (Math.random()-0.5)*Math.PI*0.25+Math.PI;
              this.temp.rotation.y = rot;
              this.temp.scale.set(this.instance_scale, this.instance_scale, this.instance_scale);
              this.temp.updateMatrix();
              this.instance_sunflower.setMatrixAt(i, this.temp.matrix);
            }
            
            this.scene.add(this.instance_sunflower);
          }
        );
    }
    getNearestSunflower(offset) {
        if (!this.instance_sunflower) return -1;
        let min = Infinity;
        let best = -1;
        this.offset_pos.copy(this.camera.position);
        this.offset_pos.z+=offset; // temporary until i remove straight line
        this.camera.getWorldDirection(this.camera_direction);
        for (let i = 0; i < this.flower_count; i++) {
            if (this.used_sunflowers.has(i)) continue;

            this.instance_sunflower.getMatrixAt(i, this.temp_matrix);
            this.temp_position.setFromMatrixPosition(this.temp_matrix);

            this.to_sunflower.subVectors(this.temp_position, this.camera.position).normalize(); // set distance vector (camera to sunflower) to sun_flower and normalize
            if (this.camera_direction.dot(this.to_sunflower)<0.8) continue;

            const cur_dist = this.temp_position.distanceToSquared(this.offset_pos);
            if (min > cur_dist) {
                min = cur_dist;
                best = i;
            }
        }
        return best;
    }
    placeLyric(lyric_data) {
        const { sprite, pool_id, duration, isNewWord } = lyric_data;
        if (!this.instance_sunflower) return;
        if (isNewWord) {
            const target_id = this.getNearestSunflower(0.01*duration+1);
            if (target_id===-1) return;

            if (this.pool_assigned.has(pool_id)) {
                this.used_sunflowers.delete(this.pool_assigned.get(pool_id));
            }
            
            this.pool_assigned.set(pool_id, target_id);
            this.used_sunflowers.add(target_id);
            // move sprites
            this.instance_sunflower.getMatrixAt(target_id, this.temp_matrix);
            sprite.position.setFromMatrixPosition(this.temp_matrix);
            sprite.position.y+=5;
            sprite.position.z-=1;
        }
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
            let shiftX = Math.round(dx / this.area_size); // if distance is >   half of area size
            let shiftZ = Math.round(dz / this.area_size);      
            if (shiftX !== 0 || shiftZ !== 0){
              x -= shiftX * this.area_size;
              z -= shiftZ * this.area_size;
              this.temp.position.set(x, 0, z);
              const rot = (Math.random()-0.5)*Math.PI*0.25+Math.PI;
              this.temp.rotation.y = rot;
              this.temp.scale.set(this.instance_scale, this.instance_scale, this.instance_scale);
              this.temp.updateMatrix();
              this.instance_sunflower.setMatrixAt(i, this.temp.matrix);
              needUpdate=true;
            }
        }

        if (needUpdate) { // update in one step for micro optimization
            this.instance_sunflower.instanceMatrix.needsUpdate = true;
            this.instance_sunflower.computeBoundingSphere(); // calculates for frustum culling
        }
    }
}