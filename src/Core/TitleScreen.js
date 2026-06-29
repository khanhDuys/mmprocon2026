export class TitleScreen {
    constructor(config) {
        this.config = config;
        this.onLocationSelected = null;
        this.onTitleEnter = null;
        this.onTitleExit = null;
 
        this.root = document.createElement('div');
        this.root.style.position = 'fixed';
        this.root.style.inset = '0'; 
        this.root.style.zIndex = '1000';
        document.body.appendChild(this.root);
 
        this.screens = {};
        
        this.buildLoading();
        this.buildTitle();
        this.buildMap();
 
        // default to loading screen instantly
        queueMicrotask(() => this.show('loading'));
    }
 
    buildLoading() {
        const el = document.createElement('div');
        el.style.position = 'absolute';
        el.style.inset = '0';
        el.style.backgroundColor = '#00364d';
        el.style.display = 'flex';
        el.style.justifyContent = 'center';
        el.style.alignItems = 'center';
        el.style.zIndex = '2000';
        
        const text = document.createElement('div');
        text.textContent = 'LOADING...';
        text.style.color = '#fff';
        text.style.fontSize = '48px';
        text.style.fontFamily = "'mona12', sans-serif";
        


        el.appendChild(text);
        this.root.appendChild(el);
        this.screens['loading'] = el;
    }
    
 
    buildScreenBase(key, backgroundSrc) {
        const el = document.createElement('div');
        el.style.position = 'absolute';
        el.style.inset = '0';
        el.style.backgroundImage = `url(${backgroundSrc})`;
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = 'center';
        el.style.display = 'none';
        this.root.appendChild(el);
        this.screens[key] = el;
        return el;
    }
 
    buildTitle() {
        const { background, logo, playButton, creditsButton } = this.config.title;
        const el = this.buildScreenBase('title', background);
 
        this.titleCanvas = document.createElement('canvas');
        this.titleCanvas.style.position = 'absolute';
        this.titleCanvas.style.inset = '0';
        this.titleCanvas.style.width = '100%';
        this.titleCanvas.style.height = '100%';
        el.appendChild(this.titleCanvas);
 
        this.addImage(el, logo);
        this.addTextButton(el, playButton, () => this.show('map'));
 
        this.titleVisible = false;
    }
 
    buildMap() {
        const { background, locations } = this.config.map;
        
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.inset = '0';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'; 
        overlay.style.display = 'none';
        this.root.appendChild(overlay);
        this.screens['map'] = overlay;

        const mapArea = document.createElement('div');
        mapArea.style.position = 'absolute';
        mapArea.style.top = '0';
        mapArea.style.left = '50%';
        mapArea.style.transform = 'translateX(-50%)';
        mapArea.style.height = '100%';

        const mapImg = document.createElement('img');
        mapImg.src = background;
        mapImg.style.height = '100%';
        mapImg.style.width = 'auto';
        mapImg.style.display = 'block';
        mapImg.style.imageRendering = 'pixelated';
        mapArea.appendChild(mapImg);

        const pinContainer = document.createElement('div');
        pinContainer.style.position = 'absolute';
        pinContainer.style.inset = '0';
        mapArea.appendChild(pinContainer);

        locations.forEach(loc => this.addButton(pinContainer, loc, () => {
            this.show('loading');
            if (this.onLocationSelected) this.onLocationSelected(loc.songIndex);
        }));

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.show('title');
        });

        overlay.appendChild(mapArea);
    }
 
    buildCredits() {
        const { background } = this.config.credits;
        
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.inset = '0';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'; 
        overlay.style.display = 'none';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.cursor = 'pointer';
        overlay.style.zIndex = '1500';
        
        this.root.appendChild(overlay);
        this.screens['credits'] = overlay;

        const creditsImg = document.createElement('img');
        creditsImg.src = background;
        creditsImg.style.maxWidth = '80%';
        creditsImg.style.maxHeight = '80%';
        creditsImg.style.imageRendering = 'pixelated';
        overlay.appendChild(creditsImg);

        overlay.addEventListener('click', () => {
            overlay.style.display = 'none'; 
        });
    }
 
    show(key) {
        if (key === 'map') {
            this.screens['map'].style.display = 'block';
            return;
        }

        Object.values(this.screens).forEach(s => s.style.display = 'none');
        this.screens[key].style.display = 'block';
 
        if (key === 'title' && !this.titleVisible) {
            this.titleVisible = true;
            if (this.onTitleEnter) this.onTitleEnter(this.titleCanvas);
        } else if (key !== 'title' && this.titleVisible) {
            this.titleVisible = false;
            if (this.onTitleExit) this.onTitleExit();
        }
    }

    hide() {
        this.root.style.display = 'none';
        if (this.titleVisible) {
            this.titleVisible = false;
            if (this.onTitleExit) this.onTitleExit();
        }
    }

    addImage(parent, imgConfig) {
        const el = document.createElement('img');
        el.src = imgConfig.src;
        el.style.position = 'absolute';
        el.style.left = typeof imgConfig.x === 'number' ? imgConfig.x + 'px' : imgConfig.x;
        el.style.top = typeof imgConfig.y === 'number' ? imgConfig.y + 'px' : imgConfig.y;
        if (imgConfig.w) el.style.width = typeof imgConfig.w === 'number' ? imgConfig.w + 'px' : imgConfig.w;
        if (imgConfig.h) el.style.height = typeof imgConfig.h === 'number' ? imgConfig.h + 'px' : imgConfig.h;
        el.style.imageRendering = 'pixelated';
        parent.appendChild(el);
        return el;
    }

    addTextButton(parent, btnConfig, onClick) {
        const btn = document.createElement('div');
        btn.textContent = btnConfig.text;
        btn.style.position = 'absolute';
        btn.style.left = typeof btnConfig.x === 'number' ? btnConfig.x + 'px' : btnConfig.x;
        btn.style.top = typeof btnConfig.y === 'number' ? btnConfig.y + 'px' : btnConfig.y;
        btn.style.color = btnConfig.color || '#fff';
        btn.style.fontSize = btnConfig.fontSize;
        btn.style.fontFamily = "'mona12', sans-serif"; 
        btn.style.cursor = 'pointer';
        
        btn.style.transition = 'transform 0.1s ease-out, color 0.1s ease-out';
        btn.style.transformOrigin = 'center left'; 
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'scale(1.15)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'scale(1)';
        });

        btn.addEventListener('click', onClick);
        parent.appendChild(btn);
        return btn;
    }

    addButton(parent, btnConfig, onClick) {
        const btn = this.addImage(parent, btnConfig);
        btn.style.cursor = 'pointer';
        btn.classList.add('map-pin');
        
        btn.style.transition = 'transform 0.1s ease-out';
        btn.addEventListener('mouseenter', () => btn.style.transform = 'scale(1.1)');
        btn.addEventListener('mouseleave', () => btn.style.transform = 'scale(1)');
        
        if (btnConfig.name) {
            const tooltip = document.createElement('div');
            tooltip.classList.add('pin-tooltip');
            tooltip.textContent = btnConfig.name;
            tooltip.style.position = 'absolute';
            tooltip.style.left = btn.style.left;
            tooltip.style.top = btn.style.top;
            tooltip.style.transform = 'translate(-25%, -130%)'; 
            tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            tooltip.style.color = '#fff';
            tooltip.style.padding = '4px 8px';
            tooltip.style.borderRadius = '4px';
            tooltip.style.whiteSpace = 'nowrap';
            tooltip.style.pointerEvents = 'none';
            tooltip.style.fontFamily = "'mona16', sans-serif";
            tooltip.style.fontSize = '14px';
            tooltip.style.opacity = '0';
            tooltip.style.transition = 'opacity 0.2s ease-in-out';
            tooltip.style.zIndex = '100';
            
            parent.appendChild(tooltip);

            const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

            if (isTouch) {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation(); 
                    if (btn.dataset.active === 'true') {
                        onClick(); 
                    } else {
                        document.querySelectorAll('.map-pin').forEach(p => p.dataset.active = 'false');
                        document.querySelectorAll('.pin-tooltip').forEach(t => t.style.opacity = '0');
                        
                        btn.dataset.active = 'true';
                        tooltip.style.opacity = '1';
                    }
                });

                document.addEventListener('click', (e) => {
                    if (!btn.contains(e.target)) {
                        btn.dataset.active = 'false';
                        tooltip.style.opacity = '0';
                    }
                });

            } else {
                btn.addEventListener('mouseenter', () => tooltip.style.opacity = '1');
                btn.addEventListener('mouseleave', () => tooltip.style.opacity = '0');
                btn.addEventListener('click', onClick);
            }
        } else {
            btn.addEventListener('click', onClick);
        }

        return btn;
    }
}