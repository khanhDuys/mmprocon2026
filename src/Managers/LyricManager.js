import * as THREE from 'three';
export class LyricManager { // for drawing lyrics on html canvases
    constructor(scene, max_lyric = 20) {
        this.scene = scene;
        this.max_lyric = max_lyric;
        this.pool = [];
        this.pool_idx = 0;

        this.cur_word_ref = null;
        this.selected = null;

        this.init();
    }
    init() {
        for (let i = 0; i<this.max_lyric; i++) {
            const canvas = document.createElement('canvas'); // new canvas for drawing lyrics
            canvas.width = 512;
            canvas.height = 256;
            const ctx = canvas.getContext('2d');
            const texture = new THREE.CanvasTexture(canvas);
            texture.minFilter = THREE.NearestFilter;
            texture.magFilter = THREE.NearestFilter;
            const material= new THREE.SpriteMaterial({
                map: texture, 
                transparent: true, 
                alphaTest: 0.5,
                polygonOffset: true,
                polygonOffsetFactor: -10
            });
            const sprite = new THREE.Sprite(material);
            sprite.scale.set(6, 3, 1);
            sprite.position.set(0, -9999, 0);
            this.scene.add(sprite);

            this.pool.push({sprite, canvas, ctx, texture, pool_id: i}); // push lyric sprites to pool for recycling
        }
    }
    updateAndGetLyrics(word, cur_char) {
        let isNewWord = false;
        if (this.cur_word_ref != word){ // check if new word
            this.cur_word_ref = word;
            this.selected = this.pool[this.pool_idx];
            this.pool_idx = (this.pool_idx+1)%this.max_lyric; // increment by one and cycle back if > max_lyric
            isNewWord = true;
        }
        if (this.selected) {
            this.drawWord(this.selected, word, cur_char);
        }
        return {
            sprite: this.selected.sprite,
            pool_id: this.selected.pool_id,
            duration: word.duration,
            isNewWord: isNewWord
        };
    }
    drawWord(item, word, cur_char) {
        const { ctx, canvas, texture } = item; // destructuring
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.textBaseline = 'middle';
        //ctx.textAlign = 'left';
        ctx.lineWidth = 0;
        ctx.strokeStyle = '#000000';
        ctx.font = `bold 140px "Mona12", sans-serif`;

        const chars = [];
        let c = word.firstChar;
        while (c) { // loop through words and add to chars
            chars.push(c);
            if (c ==  word.lastChar) break;
            c  = c.next;
        }

        let total_width = 0;
        const charWidths = chars.map(char => {
            const w = ctx.measureText(char.text).width;
            total_width += w;
            return w;
        });

        let startX = (canvas.width - total_width) / 2;
        const centerY = canvas.height / 2;
        ctx.textAlign = 'left'; 

        let isSung = true; 
        for (let i = 0; i < chars.length; i++) {
            const char = chars[i];
            ctx.fillStyle = isSung ? '#FFD700' : '#FFFFFF'; 
            ctx.strokeText(char.text, startX, centerY);
            ctx.fillText(char.text, startX, centerY);
            startX += charWidths[i]; 
            if (char === cur_char) isSung = false; 
        }

        texture.needsUpdate = true;
    }
}
