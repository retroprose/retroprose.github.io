class RectEdit {

    async init() {
        // initialize pixi.js
        this.pixi = new PIXI.Application();
        await this.pixi.init({ background: '#000000', resizeTo: window });
        document.body.appendChild(this.pixi.canvas);
        PIXI.TextureStyle.defaultOptions.scaleMode = 'nearest';

        this.container = new PIXI.Container();
        this.container.eventMode = 'static';
        this.pixi.stage.addChild(this.container);

        this.selected = -1;

        this.texture = await PIXI.Assets.load('../images/bomber.png');

        this.select = { state: 'none' };
        this.lastGlobal = undefined;

        this.cache = {};

        this.rects = [];

        this.rectDisplay = new PIXI.Container();
        this.sprite = new PIXI.Sprite(this.texture);
        this.container.addChild(this.sprite);
        this.container.addChild(this.rectDisplay);

        window.addEventListener("keydown", this.keyDown.bind(this)); 
        window.addEventListener("resize", this.resize.bind(this));

        this.click = this.click.bind(this);
        this.container.on('click', this.click);
        this.container.on('globalmousemove', (e) => this.lastGlobal = e.global);
  
        // get the update loop started!
        requestAnimationFrame(this.update.bind(this));

        this.bindings = {};

        const self = this;
        window.c = {
            bind: (key, fn) => {
                this.bindings[key] = fn;
                console.log(`${key} bound to ${fn}`);
            },
            dump: () => {
                console.log(self.rects);
            },
            load: (data) => {
                this.rects = data;
            },
            select: (index) => {
                console.log(`${index} selected`);
                self.selected = index;
            },
            name: (n) => {
                if (self.selected != -1) {
                    self.rects[self.selected].name = n;
                }
            },
            del: () => {
                console.log(`${self.selected} deleted`);
                self.rects.splice(self.selected, 1);
                self.selected = -1;
            }
        };

    }
    
    resize() {

    }

    click(e) {
        if (e.target == this.container) {
            const local = this.container.toLocal(e.global);
            const localx = Math.floor(local.x);
            const localy = Math.floor(local.y);
            if (this.select.state == 'none') {
                let s = -1;
                let index = 0;
                while (s == -1 && index < this.rects.length) {
                    const r = this.rects[index];
                    if (
                        localx >= r.x && localx <= r.x + r.width &&
                        localy >= r.y && localy <= r.y + r.height
                    ) {
                        s = index;
                    }
                    ++index;
                }

                if (s == -1) {
                    this.selected  = -1;
                    this.select = {
                        state: 'drag',
                        x: localx,
                        y: localy
                    };
                } else {
                    this.selected = s;
                    console.log(`selected: ${this.rects[this.selected].name}`);
                }

            } else if (this.select.state == 'drag') {
                if (localx >= this.select.x && localy >= this.select.y) {
                    this.rects.push({
                        name: '__NO_NAME__',
                        x: this.select.x,
                        y: this.select.y,
                        width: localx - this.select.x + 1,
                        height: localy - this.select.y + 1
                    });
                    this.select = {
                        state: 'none'
                    }
                } else {
                    this.select = {
                        state: 'none'
                    }
                }
            }
        }
    }

    keyDown(e) {

        if (this.bindings[e.key]) {
            this.bindings[e.key]();
        }

        const speed = 100;
        switch (e.key) {
            case 'w':
                //this.container.y += this.container.scale.y * speed;
                this.container.y += speed / this.container.scale.y;
                break;
            case 's':
                //this.container.y -= this.container.scale.y * speed;
                this.container.y -= speed / this.container.scale.y;
                break;
            case 'a':
                //this.container.x += this.container.scale.x * speed;
                this.container.x += speed / this.container.scale.x;
                break;
            case 'd':
                //this.container.x -= this.container.scale.x * speed;
                this.container.x -= speed / this.container.scale.x;
                break;
            case 'e': {
                const localOrg = this.container.toLocal(this.lastGlobal);

                this.container.scale.x = this.container.scale.x * 1.1;
                this.container.scale.y = this.container.scale.y * 1.1;
                
                const local = this.container.toLocal(this.lastGlobal);

                this.container.x += (local.x - localOrg.x) * this.container.scale.x;
                this.container.y += (local.y - localOrg.y) * this.container.scale.y;

            } break;
            case 'q': {
               const localOrg = this.container.toLocal(this.lastGlobal);

                this.container.scale.x = this.container.scale.x / 1.1;
                this.container.scale.y = this.container.scale.y / 1.1;
                
                const local = this.container.toLocal(this.lastGlobal);

                this.container.x += (local.x - localOrg.x) * this.container.scale.x;
                this.container.y += (local.y - localOrg.y) * this.container.scale.y;
            } break;
            default:
                break;
        };
    }

    clearRects() {
        while (this.rectDisplay.children.length > 0) {
            let q = this.rectDisplay.removeChildAt(0);
            q.destroy();
        }
    }

    getContext(w, h) {
        const key = `${w}_${h}`;
        if (!this.cache[key]) {
            let context = undefined;
            if (w == 1 || h == 1) {
                context = new PIXI.GraphicsContext().rect(0, 0, w, h).fill(0xffffff);
            } else {
                context = new PIXI.GraphicsContext().rect(0.5, 0.5, w - 1, h - 1).stroke({
                    width: 1,
                    color: 0xffffff
                });
            }
            this.cache[key] = context;
        }
        return this.cache[key];
    }

    update(delta) {
        this.clearRects();

        for (let i = 0; i < this.rects.length; ++i) {
            const r = this.rects[i];
            let color = 0xffff00;
            if (r.name == '__NO_NAME__') { color = 0xff0000; }
            const graphics = new PIXI.Graphics(this.getContext(r.width, r.height));
            graphics.x = r.x;
            graphics.y = r.y;
            graphics.tint = (this.selected == i) ? 0xff00ff : color;
            graphics.alpha = 0.5;
            this.rectDisplay.addChild(graphics);
        }

        if (this.select.state == 'drag') {
            const local = this.container.toLocal(this.lastGlobal);
            const width = Math.floor(local.x) - this.select.x + 1;
            const height = Math.floor(local.y) - this.select.y + 1;
            const graphics = new PIXI.Graphics(this.getContext(width, height));
            graphics.x = this.select.x;
            graphics.y = this.select.y;
            graphics.tint = 0xffff00;
            graphics.alpha = 0.5;
            this.rectDisplay.addChild(graphics);
        }


        requestAnimationFrame(this.update.bind(this));
    }


}