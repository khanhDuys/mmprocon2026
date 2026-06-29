import * as THREE from 'three';

export class RhythmManager {
    constructor(scene) {
        this.scene = scene;
        this.hitWindowMs = 300;
        this.minVisibleSpanMs = 400;
        this.activeScaleStart = 5.5;
        this.activeScaleEnd = 3.0;
        this.feedbackScaleEnd = this.activeScaleEnd * 1.5;
        this.feedbackDurationMs = 600;

        const loader = new THREE.TextureLoader();
        this.activeTexture = loader.load('/textures/blue_star.png');
        this.targetTexture = loader.load('/textures/green_star.png');
        [this.activeTexture, this.targetTexture].forEach(t => {
            t.colorSpace = THREE.SRGBColorSpace;
            t.minFilter = THREE.NearestFilter;
            t.magFilter = THREE.NearestFilter;
        });

        this.target = this.createSprite(this.targetTexture);
        this.active = this.createSprite(this.activeTexture);
        this.target.renderOrder = 998;
        this.active.renderOrder = 999;
        this.target.scale.set(this.activeScaleEnd, this.activeScaleEnd, 1);
        this.scene.add(this.target, this.active);

        this.camOffset = new THREE.Vector3();

        this.anchor = null;
        this.spawnTime = -1;
        this.targetTime = -1;
        this.resolved = true;
        this.feedbackActive = false;
        this.feedbackElapsed = 0;
    }

    createSprite(texture) {
        const material = new THREE.SpriteMaterial({
             map: texture, 
             transparent: true,
             alphaTest: 0.01, 
             fog: false,
             depthWrite: false,
            });
        const sprite = new THREE.Sprite(material);
        sprite.visible = false;
        return sprite;
    }

    spawn(anchorSprite, spawnTime, targetTime) {
        if (this.target.parent !== this.scene) {
            this.scene.attach(this.target);
        }

        this.anchor = anchorSprite;
        this.spawnTime = spawnTime;
        this.targetTime = targetTime;
        
        this.target.scale.set(this.activeScaleEnd, this.activeScaleEnd, 1);
        this.target.material.opacity = 1;
        this.feedbackActive = false; 
        
        this.active.scale.set(this.activeScaleStart, this.activeScaleStart, 1);
        this.target.visible = true;
        this.active.visible = true;
        this.resolved = false;
    }

    update(songPos, deltaTime, camera) {
        if (this.feedbackActive) {
            
            // 1. On the exact frame it gets hit, record the distance from the camera
            if (this.feedbackElapsed === 0) {
                this.camOffset.subVectors(this.target.position, camera.position);
            }
            
            // 2. Glue it to the screen by maintaining that exact offset
            this.target.position.copy(camera.position).add(this.camOffset);

            this.feedbackElapsed += deltaTime * 1000;
            const t = THREE.MathUtils.clamp(this.feedbackElapsed / this.feedbackDurationMs, 0, 1);
            const scale = THREE.MathUtils.lerp(this.activeScaleEnd, this.feedbackScaleEnd, t);
            this.target.scale.set(scale, scale, 1);
            this.target.material.opacity = THREE.MathUtils.lerp(1, 0, t);
            
            if (t >= 1) {
                this.feedbackActive = false;
                this.target.visible = false;
            }
            return;
        }

        if (this.resolved || !this.anchor) return;

        this.target.position.copy(this.anchor.position);
        this.target.position.y += 0;
        this.active.position.copy(this.target.position);

        const span = Math.max(this.targetTime - this.spawnTime, this.minVisibleSpanMs);
        const t = THREE.MathUtils.clamp((songPos - this.spawnTime) / span, 0, 1);
        const scale = THREE.MathUtils.lerp(this.activeScaleStart, this.activeScaleEnd, t);
        this.active.scale.set(scale, scale, 1);

        if (songPos > this.targetTime + this.hitWindowMs) this.hide();
    }
    tryHit(songPos) {
        if (this.resolved || this.targetTime < 0) return false;
        if (Math.abs(songPos - this.targetTime) <= this.hitWindowMs) {
            this.resolved = true;
            this.active.visible = false;
            this.feedbackActive = true;
            this.feedbackElapsed = 0;
            return true;
        }
        return false;
    }

    hide() {
        this.resolved = true;
        this.feedbackActive = false;
        this.active.visible = false;
        this.target.visible = false;
    }
}