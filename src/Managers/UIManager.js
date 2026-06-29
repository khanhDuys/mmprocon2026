export class UIManager {
    constructor() {

        this.canvas = document.getElementById('hud');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');

        this.ctx.imageSmoothingEnabled = false;


        this.paths = {
            frame: '/textures/frame.png',
            track: '/textures/grass_track.png',
            //lake: '/textures/lake.png',
            node: '/textures/dot.png',
            pin: '/textures/pin.png'
        };
        
        this.imgs = {};
        this.loadedCount = 0;
        this.totalAssets = Object.keys(this.paths).length;
        

        
        this.tx = 4;
        this.ty = 15;
        this.tw = 128;
        this.th = 16;

        this.starCanvas = document.createElement('canvas');
        this.starCanvas.width = 300;
        this.starCanvas.height = 36;
        this.starCanvas.style.position = 'absolute';
        this.starCanvas.style.imageRendering = 'pixelated';
        document.body.appendChild(this.starCanvas);
        this.starCtx = this.starCanvas.getContext('2d');
        this.starCtx.imageSmoothingEnabled = false;

        this.positionStarCanvas();
        window.addEventListener('resize', () => this.positionStarCanvas());

        this.init();
    }
    positionStarCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.starCanvas.style.left = rect.left + 'px';
        this.starCanvas.style.top = (rect.top - this.starCanvas.height - 4) + 'px';
    }
    init() {
        Object.entries(this.paths).forEach(([key, src]) => {
            const img = new Image();
            img.src = src;
            img.onload = () => this.loadedCount++;
            this.imgs[key] = img;
        });
    }
    setStars(collected, total) {
        if (!this.starCtx) return;
        const ctx = this.starCtx;
        ctx.clearRect(0, 0, this.starCanvas.width, this.starCanvas.height);
        const fontSize = 24;
        ctx.font = `bold ${fontSize}px "Mona12", sans-serif`;
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#00e5ff';
        ctx.strokeStyle = '#081163';
        ctx.lineWidth = fontSize * 0.1;
        const text = `Collected stars ${collected}/${total}`;
        ctx.strokeText(text, 4, this.starCanvas.height / 2);
        ctx.fillText(text, 4, this.starCanvas.height / 2);
    }
    draw(currentPos, totalDuration) {
        if (!this.ctx || this.loadedCount < this.totalAssets) return;

        const ratio = (currentPos/totalDuration);
        
        this.ctx.imageSmoothingEnabled = false;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.drawImage(this.imgs.frame, 0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.imgs.track, this.tx, this.ty, this.tw, this.th);

        this.ctx.drawImage(this.imgs.pin, this.tx + 117, this.ty - 9, 11, 17);

        this.ctx.drawImage(this.imgs.node, this.tx+3+Math.round(115*ratio), this.ty+3 , 9, 9);

    }
}