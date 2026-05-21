import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
export class Sunflowers {
    constructor(scene, camera, count, params) {
        this.scene = scene;
        this.camera = camera;
        this.flower_count = count;

        this.temp = new THREE.Object3D(); // dummy for position randomizing
        this.instance_position = new THREE.Vector3();
        this.instance_sunflower = null;
        this.instance_scale = 0.1;
        // for lyric pool
        this.active_lyrics = new Map();

        // pre-allocated math for no garbage collection
        this.temp_matrix = new THREE.Matrix4();
        this.temp_position = new THREE.Vector3();
        this.to_sunflower = new THREE.Vector3();
        this.camera_direction = new THREE.Vector3(); 
        this.offset_pos = new THREE.Vector3();
        this.blocker = new THREE.Vector3();
        this.to_blocker = new THREE.Vector3();

        //parameters
        this.params = params;

        this.init();
    }

    init() {
        const loader = new GLTFLoader();
        loader.load('/models/Sunflower.glb', (gltf) => {
            let flower_geo = null;
            let flower_mat = null;
        
            
            gltf.scene.traverse((child) =>   { // loop through children
            if (child.isMesh&&!flower_geo) { // if is flower mesh
                flower_mat = child.material;
                flower_geo = child.geometry;
                flower_geo.computeBoundingSphere();
                flower_mat.side = THREE.DoubleSide;
                flower_mat.alphaTest = 0.5;
                flower_mat.depthWrite = true; // force three.js to calc depth
                flower_mat.onBeforeCompile = (shader) => {
                    
                }
              }
            })
            this.instance_sunflower = new THREE.InstancedMesh(flower_geo, flower_mat, this.flower_count);
            for (let i = 0; i<this.flower_count; i++) {
              const x = this.params.area_size*(Math.random()-0.5);
              const z = this.params.area_size*(Math.random()-0.5);
              this.temp.position.set(x, 0, z);
              const rot = (Math.random()-0.5)*Math.PI*0.25+Math.PI;
              this.temp.rotation.set(0, rot, 0);
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
        this.offset_pos.z+=offset; // temporary until i removex straight line
        this.camera.getWorldDirection(this.camera_direction);


        for (let i = 0; i < this.flower_count; i++) {
            if (this.active_lyrics.has(i)) continue;

            this.instance_sunflower.getMatrixAt(i, this.temp_matrix);
            this.temp_position.setFromMatrixPosition(this.temp_matrix);

            const dist = this.temp_position.distanceToSquared(this.offset_pos);
            if (dist > this.params.max_dist*this.params.max_dist) continue;
            
            this.to_sunflower.subVectors(this.temp_position, this.camera.position).normalize(); // set distance vector (camera to sunflower) to sun_flower and normalize
            if (this.camera_direction.dot(this.to_sunflower)<this.params.dot_camera) continue; // change to skip sunflowers that arent in the camera's direction
            

            let flag = false;
            for (const [idx, sprite] of this.active_lyrics) {
                this.instance_sunflower.getMatrixAt(idx, this.temp_matrix);
                this.blocker.setFromMatrixPosition(this.temp_matrix);
                this.to_blocker.subVectors(this.blocker, this.camera.position).normalize();
                if (this.to_sunflower.dot(this.to_blocker) > this.params.dot_sunflower) { // if blocked
                    flag = true; break;
                }
            }
            if (flag) continue;

            if (min > dist) {min = dist; best = i;}
        }
        return best;
    }
    placeLyric(lyric_data) {
        const { sprite, pool_id, end_time, duration, isNewWord } = lyric_data;
        if (!this.instance_sunflower) return;
        if (isNewWord) {
            const target_id = this.getNearestSunflower(this.params.duration_weight*duration+this.params.offset_flower);
            if (target_id === -1) return;

            if ((sprite.userData.sunflower_idx != 1) && (this.active_lyrics.has(sprite.userData.sunflower_idx))) {
                this.active_lyrics.delete(sunflower_idx);
            }
                        
            this.active_lyrics.set(target_id, sprite);
            // move sprites
            this.instance_sunflower.getMatrixAt(target_id, this.temp_matrix);
            sprite.position.setFromMatrixPosition(this.temp_matrix);
            sprite.position.y+=5.25;
            sprite.position.z-=0.8;
        }
    }
    update(camera, deltaTime, songPos) {
        if (!this.instance_sunflower) return;
        
        let needUpdate = false;
        for (let i = 0; i<this.flower_count; i++) {
            this.instance_sunflower.getMatrixAt(i, this.temp.matrix);
            this.instance_position.setFromMatrixPosition(this.temp.matrix);
            let { x, y, z } = this.instance_position;
            let dx = x-camera.position.x;
            let dz = z-camera.position.z;
            let shiftX = Math.round(dx / this.params.area_size); // if distance is >   half of area size
            let shiftZ = Math.round(dz / this.params.area_size);      

            if (shiftX !== 0 || shiftZ !== 0){
                if (this.active_lyrics.has(i)) {
                    this.active_lyrics.get(i).userData.sunflower_idx = -1; // not using
                    this.active_lyrics.get(i).userData.end_time = - 1;
                    this.active_lyrics.delete(i);
                }
                x -= shiftX * this.params.area_size;
                z -= shiftZ * this.params.area_size;
                this.temp.position.set(x, 0, z);
                const rot = (Math.random()-0.5)*Math.PI*0.25+Math.PI;
                this.temp.rotation.set(0, rot, 0);
                this.temp.scale.set(this.instance_scale, this.instance_scale, this.instance_scale);
                this.temp.updateMatrix();
                this.instance_sunflower.setMatrixAt(i, this.temp.matrix);
                needUpdate=true;
            }

            if (this.active_lyrics.has(i)) {
                if (Math.abs(2-y)>0.01) {
                    let newY = THREE.MathUtils.damp(y, 2, 10.0, deltaTime);
                    let dy = (newY-y);
                    y = newY;
                    this.temp.position.set(x, newY, z);
                    
                    this.temp.rotation.setFromRotationMatrix(this.temp.matrix);
                    this.temp.scale.set(this.instance_scale, this.instance_scale, this.instance_scale);

                    this.temp.updateMatrix();
                    
                    this.instance_sunflower.setMatrixAt(i, this.temp.matrix);

                    if (this.active_lyrics.has(i)) {
                        this.active_lyrics.get(i).position.y += dy; // move lyric up
                    }

                    needUpdate = true;
                }
                if (this.active_lyrics.get(i).userData.end_time < songPos) {
                    
                }
            }
        }

        if (needUpdate) { // update in one step for micro optimization
            this.instance_sunflower.instanceMatrix.needsUpdate = true;
            this.instance_sunflower.computeBoundingSphere(); // calculates for frustum culling
        }
    }
}