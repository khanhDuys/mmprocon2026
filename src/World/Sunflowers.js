import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
export class Sunflowers {
    constructor(scene, camera, count, params) {
        this.scene = scene;
        this.camera = camera;
        this.flower_count = count;

        this.temp = new THREE.Object3D(); // dummy for position randomizing
        this.instance_sunflower = null;
        this.instance_scale = 0.1;
        // for lyric pool
        this.active_lyrics = new Map();

        this.pos_x = new Float32Array(count);
        this.pos_y = new Float32Array(count); // lyric lift height, 0 = resting on ground
        this.pos_z = new Float32Array(count);
        this.cur_angle = new Float32Array(count);

        // pre-allocated math for no garbage collection
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
                flower_mat.map.colorSpace = THREE.SRGBColorSpace;
                flower_mat.alphaTest = 0.5;
                flower_mat.depthWrite = true; // force three.js to calc depth
                flower_mat.onBeforeCompile = (shader) => {
                    
                }
              }
            })
            this.instance_sunflower = new THREE.InstancedMesh(flower_geo, flower_mat, this.flower_count);

            this.instance_sunflower.instanceMatrix.setUsage(THREE.DynamicDrawUsage);


            this.instance_sunflower.frustumCulled = false;

            for (let i = 0; i<this.flower_count; i++) {
              const x = this.params.area_size*(Math.random()-0.5);
              const z = this.params.area_size*(Math.random()-0.5);
              this.pos_x[i] = x;
              this.pos_y[i] = 0;
              this.pos_z[i] = z;
              this.temp.position.set(x, 0, z);
              const rot = (Math.random()-0.5)*Math.PI*0.25+Math.PI;
              this.temp.rotation.set(0, rot, 0);
              this.cur_angle[i] = rot;
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
        let second_best = -1;
        this.offset_pos.copy(this.camera.position);
        this.offset_pos.z+=offset; // temporary until i removex straight line
        this.camera.getWorldDirection(this.camera_direction);


        for (let i = 0; i < this.flower_count; i++) {
            if (this.active_lyrics.has(i)) continue;

            this.temp_position.set(this.pos_x[i], this.pos_y[i], this.pos_z[i]);

            const dist = this.temp_position.distanceToSquared(this.offset_pos);
            if (dist > this.params.max_dist*this.params.max_dist) continue;
            
            this.to_sunflower.subVectors(this.temp_position, this.camera.position).normalize(); // set distance vector (camera to sunflower) to sun_flower and normalize
            if (this.camera_direction.dot(this.to_sunflower)<this.params.dot_camera) continue; // change to skip sunflowers that arent in the camera's direction
            second_best = i;

            let flag = false;
            for (const [idx, sprite] of this.active_lyrics) {
                this.blocker.set(this.pos_x[idx], this.pos_y[idx], this.pos_z[idx]); 
                this.to_blocker.subVectors(this.blocker, this.camera.position).normalize();
                if (this.to_sunflower.dot(this.to_blocker) > this.params.dot_sunflower) { // if blocked
                    flag = true; break;
                }
            }
            if (flag) continue;

            if (min > dist) {min = dist; best = i;}
        }
        if (best!==1) return best;
        console.log("cannot find");
    }
    placeLyric(lyric_data) {
        const { sprite, pool_id, end_time, duration, isNewWord } = lyric_data;
        if (!this.instance_sunflower) return;
        if (isNewWord) {
            const target_id = this.getNearestSunflower(this.params.duration_weight*duration+this.params.offset_flower);
            if (target_id === -1) return;

            if ((sprite.userData.sunflower_idx != -1) && (this.active_lyrics.has(sprite.userData.sunflower_idx))) {
                this.active_lyrics.delete(sunflower_idx);
            }

            sprite.userData.sunflower_idx = target_id;
            sprite.userData.end_time = end_time;
                        
            this.active_lyrics.set(target_id, sprite);
            // move sprites
            sprite.position.set(this.pos_x[target_id], this.pos_y[target_id], this.pos_z[target_id]);
        }
    }
    update(camera, deltaTime, songPos) {
        if (!this.instance_sunflower) return;

        let needUpdate = false;
        const areaSize = this.params.area_size;
        const camX = camera.position.x;
        const camZ = camera.position.z;


        for (let i = 0; i < this.flower_count; i++) {
            const dx = this.pos_x[i] - camX;
            const dz = this.pos_z[i] - camZ;
            const shiftX = Math.round(dx / areaSize);
            const shiftZ = Math.round(dz / areaSize);

            if (shiftX === 0 && shiftZ === 0) continue;

            if (!this.params.title&&this.active_lyrics.has(i)) {
                this.active_lyrics.get(i).userData.sunflower_idx = -1; // not using
                this.active_lyrics.get(i).userData.end_time = -1;
                this.active_lyrics.delete(i);
            }

            const x = this.pos_x[i] - shiftX * areaSize;
            const z = this.pos_z[i] - shiftZ * areaSize;
            this.pos_x[i] = x;
            this.pos_y[i] = 0;
            this.pos_z[i] = z;

            const rot = (Math.random()-0.5)*Math.PI*0.25+Math.PI;
            this.cur_angle[i] = rot;

            this.temp.position.set(x, 0, z);
            this.temp.rotation.set(0, rot, 0);
            this.temp.scale.set(this.instance_scale, this.instance_scale, this.instance_scale);
            this.temp.updateMatrix();
            this.instance_sunflower.setMatrixAt(i, this.temp.matrix);
            needUpdate = true;
        }
        if (this.params.title) {
            if (needUpdate) {
                this.instance_sunflower.instanceMatrix.needsUpdate = true;
            }
            return;
        }
        for (const [i, sprite] of this.active_lyrics) {
            const x = this.pos_x[i];
            const z = this.pos_z[i];
            const y = this.pos_y[i];
            const dx = x - camX;
            const dz = z - camZ;

            const expired = sprite.userData.end_time !== -1 && sprite.userData.end_time < songPos;
            const targetY = expired ? 0 : 2.5;
            const speed = expired ? 4.0 : 10.0;

            const newY = THREE.MathUtils.damp(y, targetY, speed, deltaTime);
            sprite.position.y = newY + 5.25; // move lyric up
            this.pos_y[i] = newY;

            const targetAngle = Math.atan2(-dx, -dz);
            const delta = THREE.MathUtils.euclideanModulo(targetAngle - this.cur_angle[i] + Math.PI, Math.PI*2) - Math.PI; // shortest signed turn
            this.cur_angle[i] = THREE.MathUtils.damp(this.cur_angle[i], this.cur_angle[i]+delta, 8.0, deltaTime);

            this.temp.position.set(x, newY, z);
            this.temp.rotation.set(0, this.cur_angle[i], 0);
            this.temp.scale.set(this.instance_scale, this.instance_scale, this.instance_scale);
            sprite.position.x = x + Math.sin(this.cur_angle[i]) * 1.5;
            sprite.position.z = z + Math.cos(this.cur_angle[i]) * 1.5;
            this.temp.updateMatrix();
            this.instance_sunflower.setMatrixAt(i, this.temp.matrix);
            needUpdate = true;

            if (expired && newY <= 0.02) {
                sprite.userData.sunflower_idx = -1;
                sprite.userData.end_time = -1;
                this.active_lyrics.delete(i);
            }
        }

        if (needUpdate) {
            this.instance_sunflower.instanceMatrix.needsUpdate = true;
        }
    }
}