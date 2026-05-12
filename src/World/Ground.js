    import * as THREE from 'three';
    import vertexShader from '../Shaders/ground/vertex.glsl';
    import fragmentShader from '../Shaders/ground/fragment.glsl';

    export class Ground {
        constructor(scene) {
            this.scene = scene;
            this.init();
        }

        init() {
            const grassTexture = new THREE.TextureLoader().load('/textures/grass.png');
            grassTexture.colorSpace = THREE.SRGBColorSpace;
            grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
            grassTexture.minFilter = grassTexture.magFilter = THREE.NearestFilter;

    
            const geo = new THREE.PlaneGeometry(500, 500);
            const mat = new THREE.MeshStandardMaterial({
                map: grassTexture
            });
            mat.onBeforeCompile = (shader) => {
            shader.vertexShader = shader.vertexShader.replace(
                '#include <uv_vertex>',
                `#include <uv_vertex>
                vec4 worldPos = modelMatrix * vec4(position, 1.0);
                vMapUv = worldPos.xz * 0.2; // scale to adjust tiling
                `
            );
            };
            this.ground = new THREE.Mesh(geo, mat);
            this.ground.rotation.x = -Math.PI / 2;
            this.ground.position.y = -4;0
            //this.ground.receiveShadow = true;
            this.scene.add(this.ground);
        }

        update(camera) {
            this.ground.position.x = camera.position.x;
            this.ground.position.z = camera.position.z;
        }
    }