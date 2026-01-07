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
        this.index = 0;

        /*
[
    {
        "name": "particle",
        "x": 9,
        "y": 431,
        "width": 2,
        "height": 2
    },
    {
        "name": "shot",
        "x": 135,
        "y": 430,
        "width": 4,
        "height": 2
    },
    {
        "name": "turret",
        "x": 108,
        "y": 430,
        "width": 8,
        "height": 2
    },
    {
        "name": "blue_tank",
        "x": 55,
        "y": 427,
        "width": 12,
        "height": 10
    },
    {
        "name": "blue_local",
        "x": 55,
        "y": 451,
        "width": 12,
        "height": 10
    },
    {
        "name": "greeen_local",
        "x": 84,
        "y": 451,
        "width": 12,
        "height": 10
    },
    {
        "name": "green_tank",
        "x": 84,
        "y": 427,
        "width": 12,
        "height": 10
    }
]

            c.folder('burrower/images/')
            c.bmp('sprite.png')
            c.bindmap({
                'n': window.c.rect,
                'o': window.c.shift,
                'p': window.c.expand,
                'f': window.c.delete,
                ' ': window.c.select
            })
            c.clear()

            c.folder('runner/images/')
            c.bmp('runner-sprite.png')
            c.bindmap({
                'n': window.c.rect,
                'o': window.c.shift,
                'p': window.c.expand,
                'f': window.c.delete,
                ' ': window.c.select
            })
            c.clear()
            c.cursor(0,288)
            c.grid(16,16,32,12,0,0,'tile')
            c.cursor(4,132)            
            c.grid(24,24,10,2,8,8,'astro')
            c.cursor(389, 229)
            c.grid(6,6,1,1,0,0,'hook')
            c.cursor(0, 0)
            c.grid(120,120,4,1,8,0,'drill')
            c.cursor(320, 224)
            c.grid(16,16,1,1,0,0,'gem')
            c.pixidump()

        */

        // astronaut 24x24
        // c.cursor(4,132)
        // c.grid(24,24,10,2,8,8,'astro')
        // c.pixidump()
        
        this.image_name = '';
        this.folder_name = '';

        //this.image_name = 'runner-sprite.png';
        //this.texture = await PIXI.Assets.load('../../../runner/images/' + this.image_name);

        this.texture = undefined;

        //console.log(this.texture);

        this.cursor = { x: 0.0, y: 0.0 };
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

        const self = this;
        window.c = {
            folder: (n) => {
                self.folder_name = n;
            },
            bmp: (n) => {
                self.image_name = n;
                if (self.texture) {
                    self.texture.destroy(true);
                    self.texture = undefined;
                }
                PIXI.Assets.load('../../../' + self.folder_name + n).then((texture) => {
                    self.texture = texture;
                    self.sprite.texture = texture;
                });
            },
            dumpmap: () => {
                const pixelArray = self.pixi.renderer.extract.pixels(self.texture);
                const easyarray = [];
                for (let i = 0; i < 512*512; ++i) {
                    let t;
                    if (pixelArray.pixels[i*4] == 0) {
                        t = 0;
                    } else {
                        t = 1;
                    }
                    easyarray.push(t);
                }
                console.log(easyarray); // A Uint8Array with RGBA values (0-255)                
            },
            bindmap: (m) => {
                self.bindings = m;
            },
            bind: (key, fn) => {
                self.bindings[key] = fn;
                console.log(`${key} bound to ${fn}`);
            },
            pixidump: () => {
                let dict = {   
                    "frames": { },
                    "meta": {
                        "image": "/" + self.image_name,
                        "format": "RGBA8888",
                        "size": {"w":self.texture.frame.width,"h":self.texture.frame.height},
                        "scale": "1"
                    }
                };
                for (let item of self.rects) {
                    dict["frames"][item["name"]] = {
                        "frame": {
                            "x": item["x"],
                            "y": item["y"],
                            "w": item["width"],
                            "h": item["height"]
                        },
                        "spriteSourceSize": {
                            "x": 0,
                            "y": 0,
                            "w": item["width"],
                            "h": item["height"]
                        },
                        "sourceSize": {
                            "w": item["width"],
                            "h": item["height"]
                        },
                        "anchor": {
                            "x": 0,
                            "y": 0
                        }
                    };
                };
                console.log(dict);
            },
            dump: () => {
                console.log(self.rects);
            },
            load: (data) => {
                self.rects = data;
            },
            grid: (pw, ph, col, row, ox, oy, name = '__NO_NAME') => {
                let ypos = self.cursor.y;
                for (let r = 0; r < row; ++r) {
                    let xpos = self.cursor.x;
                    for (let c = 0; c < col; ++c) {
                        self.rects.push({
                            name: name + "_" + c + "_" + r,
                            x: xpos,
                            y: ypos,
                            width: pw,
                            height: ph
                        });
                        xpos += pw + ox;
                    }
                    ypos += ph + oy;
                }
            },
            rect: () => {
                self.selected = self.rects.length;
                self.rects.push({
                    name: '__NO_NAME__',
                    x: this.cursor.x,
                    y: this.cursor.y,
                    width: 1,
                    height: 1
                });
            },
            expand: () => {
                let r = self.rects[self.selected];
                let width = self.cursor.x - r.x + 1;
                let height = self.cursor.y - r.y + 1;
                if (width > 0) { r.width = width; }
                if (height > 0) { r.height = height; }
            },
            shift: () => {
                let r = self.rects[self.selected];
                r.x = self.cursor.x;
                r.y = self.cursor.y;
            },
            cursor: (x, y) => {
                self.cursor.x = Math.floor(x);
                self.cursor.y = Math.floor(y);
                console.log("c.cursor(" + self.cursor.x + ", " + self.cursor.y + ")");
            },
            select: () => {
                const localx = self.cursor.x;
                const localy = self.cursor.y;
                let s = -1;
                let index = 0;
                while (s == -1 && index < self.rects.length) {
                    const r = self.rects[index];
                    if (
                        localx >= r.x && localx <= r.x + r.width &&
                        localy >= r.y && localy <= r.y + r.height
                    ) {
                        s = index;
                    }
                    ++index;
                }
                if (s != -1) {
                    self.selected = s;
                    console.log(`selected ${s}: ${self.rects[self.selected].name} { ${self.rects[self.selected].width}, ${self.rects[self.selected].height} }`);

                    /*let name = self.rects[self.selected].name;
                    let split = name.split("_");
                    let xc = parseInt(split[1]);
                    let yc = parseInt(split[2]);
                    let index = yc * 32 + xc;
                    console.log(`index: ${index}`);*/

                }
            },
            name: (n) => {
                if (self.selected != -1) {
                    self.rects[self.selected].name = n;
                }
            },
            clear: () => {
                self.rects = [];
            },
            del: () => {
                console.log(`${self.selected} deleted`);
                self.rects.splice(self.selected, 1);
                self.selected = -1;
            }
        };

        this.bindings = { };

    }
    
    resize() {

    }

    click(e) {
        if (e.target == this.container) {
            const local = this.container.toLocal(e.global);
            this.cursor.x = Math.floor(local.x);
            this.cursor.y = Math.floor(local.y);
            console.log("c.cursor(" + this.cursor.x + ", " + this.cursor.y + ")");
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

    next() {
        if (this.rectDisplay.children.length <= this.index) {
            this.rectDisplay.addChild(new PIXI.Graphics());
        }
        let sprite = this.rectDisplay.children[this.index++];
        return sprite;
    }

    begin() {
        this.index = 0;
    }

    end() {
        // run though the rest of the unused sprites and set to visible false!
        for (let i = this.index; i < this.rectDisplay.children.length; ++i) {
            this.rectDisplay.children[i].visible = false;
        }
    }

    getCursorContext() {
        const key = "cursor_key";
        if (!this.cache[key]) {
            let context = undefined;
            context = new PIXI.GraphicsContext().rect(-2, 0, 5, 1).rect(0, -2, 1, 5).fill(0xffffff);
            this.cache[key] = context;
        }
        return this.cache[key];
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
        this.begin();

        for (let i = 0; i < this.rects.length; ++i) {
            const r = this.rects[i];
            let color = 0xffff00;
            if (r.name == '__NO_NAME__') { color = 0xff0000; }
            const graphics = this.next();
            graphics.context = this.getContext(r.width, r.height);
            graphics.visible = true;
            graphics.x = r.x;
            graphics.y = r.y;
            graphics.tint = (this.selected == i) ? 0xff00ff : color;
            graphics.alpha = 0.5;
        }

        // cursor
        const graphics = this.next();
        graphics.context = this.getCursorContext();
        graphics.visible = true;
        graphics.x = this.cursor.x;
        graphics.y = this.cursor.y;
        graphics.tint = 0xffffff;
        graphics.alpha = 0.5;

        this.end();

        requestAnimationFrame(this.update.bind(this));
    }


}