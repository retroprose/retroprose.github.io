class BodyEdit {

    async init() {
        const self = this;

        // 22.627416997969520780827019587355

        // initialize pixi.js
        this.pixi = new PIXI.Application();
        await this.pixi.init({ background: '#000000', resizeTo: window });
        document.body.appendChild(this.pixi.canvas);

        PIXI.TextureStyle.defaultOptions.scaleMode = 'nearest';

        this.sprite = undefined;
        PIXI.Assets.load('../../../runner/images/runner-sprite.json').then((texture) => {
            self.sprite = [];
            let i = 0
            for (var k in texture.textures) {
                self.sprite[i] = texture.textures[k];

                if (k == "astro_0_0") {
                    console.log("astro_0_0: " + i);
                } else if (k == "hook_0_0") {
                    console.log("hook_0_0: " + i);
                }
                ++i;
            }
            console.log("texture loaded.");
        });

        const response = await fetch('../../../runner/data/map-data.json');
		this.map = await response.json();

        const response2 = await fetch('../../../runner/data/map-back-data.json');
		this.backmap = await response2.json();

        this.data = [];
        for (let i = 0; i < 8; ++i) {
            this.data.push(
                {
                    x: i * 60 * 16,
                    y: 0,
                    w: 60 * 16,
                    h: 34 * 16,
                    data: []
                }
            );
        }

        this.selectedGroup = 0;
        this.selected = -1
        this.cursor = {
            x: 0,
            y: 0
        };

        this.screen = new ScreenEditor();
        this.screen.eventMode = 'static';
        this.pixi.stage.addChild(this.screen);

        //console.log(this.texture);

        window.addEventListener("keydown", this.keyDown.bind(this)); 
        window.addEventListener("resize", this.resize.bind(this));

        this.lastGlobal = undefined;
        this.click = this.click.bind(this);
        this.screen.on('click', this.click);
        this.screen.on('globalmousemove', (e) => this.lastGlobal = e.global);
  
        // get the update loop started!
        requestAnimationFrame(this.update.bind(this));

        
        window.c = {
            bindmap: (m) => {
                self.bindings = m;
            },
            bind: (key, fn) => {
                self.bindings[key] = fn;
                console.log(`${key} bound to ${fn}`);
            },
            dump: () => {
                console.log(self.data);
            },
            load: (newdata) => {
                self.data = newdata;
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
            cursor: (x, y) => {
                self.cursor.x = Math.floor(x);
                self.cursor.y = Math.floor(y);
                console.log("c.cursor(" + self.cursor.x + ", " + self.cursor.y + ")");
            },
            addbox: () => {
                self.selected = self.data[self.selectedGroup].data.length;
                self.data[self.selectedGroup].data.push({
                    x: this.cursor.x,
                    y: this.cursor.y,
                    w: 10,
                    h: 10,
                    r: 0
                })
            },
            selectupgroup: () => {
                if (self.selectedGroup < 7) {
                    self.selectedGroup++;
                    self.selected = -1;
                } else {
                    self.selectedGroup = 0;
                    self.selected = -1;
                }
            },
            selectdowngroup: () => {
                if (self.selectedGroup > 0) {
                    self.selectedGroup--;
                    self.selected = -1;
                } else {
                    self.selectedGroup = 7;
                    self.selected = -1;
                }           
            },
            selectup: () => {
                if (self.selected < self.data[self.selectedGroup].data.length - 1) {
                    self.selected++;
                } else {
                    self.selected = 0;
                }
            },
            selectdown: () => {
                if (self.selected > 0) {
                    self.selected--;
                } else {
                    self.selected = self.data[self.selectedGroup].data.length - 1;
                }           
            },
            setrotneg: () => {
                self.data[self.selectedGroup].data[self.selected].r = -1;
            },
            setrotpos: () => {
                self.data[self.selectedGroup].data[self.selected].r = 1;
            },
            setrotnut: () => {
                self.data[self.selectedGroup].data[self.selected].r = 0;
            },
            shift: () => {
                self.data[self.selectedGroup].data[self.selected].x = self.cursor.x;
                self.data[self.selectedGroup].data[self.selected].y = self.cursor.y;
            },
            expand: () => {
                self.data[self.selectedGroup].data[self.selected].w = Math.abs(self.data[self.selectedGroup].data[self.selected].x - self.cursor.x);
                self.data[self.selectedGroup].data[self.selected].h = Math.abs(self.data[self.selectedGroup].data[self.selected].y - self.cursor.y);
            },
            setsize: (w, h) => {
                self.data[self.selectedGroup].data[self.selected].w = w
                self.data[self.selectedGroup].data[self.selected].h = h
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
                self.data[self.selectedGroup].data.splice(self.selected, 1);
                self.selected = -1;
            }
        };

        this.bindings = {
            'Backspace': window.c.del,
            'v': window.c.expand,
            ' ': window.c.shift,
            'c': window.c.setrotpos,
            'x': window.c.setrotnut,
            'z': window.c.setrotneg,
            'k': window.c.selectdown,
            'l': window.c.selectup,
            'o': window.c.selectdowngroup,
            'p': window.c.selectupgroup,
            'n': window.c.addbox
        };

    }
    
    resize() {

    }

    click(e) {
        if (e.target == this.screen) {
            const local = this.screen.toLocal(e.global);
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
                //this.screen.y += this.screen.scale.y * speed;
                this.screen.y += speed / this.screen.scale.y;
                break;
            case 's':
                //this.screen.y -= this.screen.scale.y * speed;
                this.screen.y -= speed / this.screen.scale.y;
                break;
            case 'a':
                //this.screen.x += this.screen.scale.x * speed;
                this.screen.x += speed / this.screen.scale.x;
                break;
            case 'd':
                //this.screen.x -= this.screen.scale.x * speed;
                this.screen.x -= speed / this.screen.scale.x;
                break;
            case 'e': {
                const localOrg = this.screen.toLocal(this.lastGlobal);

                this.screen.scale.x = this.screen.scale.x * 1.1;
                this.screen.scale.y = this.screen.scale.y * 1.1;
                
                const local = this.screen.toLocal(this.lastGlobal);

                this.screen.x += (local.x - localOrg.x) * this.screen.scale.x;
                this.screen.y += (local.y - localOrg.y) * this.screen.scale.y;

            } break;
            case 'q': {
               const localOrg = this.screen.toLocal(this.lastGlobal);

                this.screen.scale.x = this.screen.scale.x / 1.1;
                this.screen.scale.y = this.screen.scale.y / 1.1;
                
                const local = this.screen.toLocal(this.lastGlobal);

                this.screen.x += (local.x - localOrg.x) * this.screen.scale.x;
                this.screen.y += (local.y - localOrg.y) * this.screen.scale.y;
            } break;
            default:
                break;
        };
    }


    drawCursor() {
        let s = undefined;
        
        s = this.screen.next();
        s.anchor.set(0);
        s.x = this.cursor.x;
        s.y = this.cursor.y - 2;
        s.texture = this.screen.ascii[256];
        s.height = 5;
        s.width = 1;
        s.tint = 0xffffff;
        s.alpha = 0.5;
        
        s = this.screen.next();
        s.anchor.set(0);
        s.x = this.cursor.x - 2;
        s.y = this.cursor.y;
        s.texture = this.screen.ascii[256];
        s.height = 1;
        s.width = 5;    
        s.tint = 0xffffff;
        s.alpha = 0.5;
    }

    drawRect(x, y, w, h, c, a) {
        let s = undefined;
        
        s = this.screen.next();
        s.anchor.set(0);
        s.x = x;
        s.y = y;
        s.texture = this.screen.ascii[256];
        s.height = 1;
        s.width = w;
        s.tint = c;
        s.alpha = a;
        
        s = this.screen.next();
        s.anchor.set(0);
        s.x = x;
        s.y = y;
        s.texture = this.screen.ascii[256];
        s.height = h;
        s.width = 1;
        s.tint = c;
        s.alpha = a;

        s = this.screen.next();
        s.anchor.set(0);
        s.x = x + w - 1;
        s.y = y;
        s.texture = this.screen.ascii[256];
        s.height = h;
        s.width = 1;
        s.tint = c;
        s.alpha = a;
        
        s = this.screen.next();
        s.anchor.set(0);
        s.x = x;
        s.y = y + h - 1;
        s.texture = this.screen.ascii[256];
        s.height = 1;
        s.width = w;    
        s.tint = c;
        s.alpha = a;
    }

    drawSolidRect(x, y, w, h, c, a) {
        let s = this.screen.next();
        s.anchor.set(0.5);
        s.x = x;
        s.y = y;
        s.texture = this.screen.ascii[256];
        s.height = h;
        s.width = w;    
        s.tint = c;
        s.alpha = a;
    }

    update(delta) {
        if (!this.sprite || !this.screen.ascii) {
            requestAnimationFrame(this.update.bind(this));
            return;
        }

        this.screen.begin();

        // don't draw this stuff
        /*for (let k = 0; k < 15; ++k) {
            for (let j = 0; j < this.backmap.height; ++j) {
                for (let i = 0; i < this.backmap.width; ++i) {
                    let index = j * this.backmap.width + i;
                    let s = this.screen.next();
                    s.anchor.set(0);
                    s.x = i * 16 + k * 32 * 16;
                    s.y = j * 16;
                    s.texture = this.sprite[this.backmap.data[index]];
                    s.scale.set(1);    
                }
            }
        }*/
      
        for (let j = 0; j < this.map.height; ++j) {
            for (let i = 0; i < this.map.width; ++i) {
                let index = j * this.map.width + i;
                let s = this.screen.next();
                s.anchor.set(0);
                s.x = i * 16;
                s.y = j * 16;
                s.texture = this.sprite[this.map.data[index]];
                s.scale.set(1);    
            }
        }

        
        for (let i = 0; i < this.data.length; ++i) {
            let item = this.data[i];
            let color = 0x0000ff;
            if (i == this.selectedGroup) { color = 0xff00ff; }
            this.drawRect(item.x, item.y, item.w, item.h, color, 0.5);
            for (let j = 0; j < item.data.length; ++j) {
                let b = item.data[j];
                let s = undefined;
                let rot = 0.0;
                if (b.r == 1) {
                    rot = 45 * PIXI.DEG_TO_RAD;
                } else if (b.r == -1) {
                    rot = -45 * PIXI.DEG_TO_RAD;
                }

                let color = 0xffffff;
                if (j == this.selected) { color = 0xff0000; }

                s = this.screen.next();
                s.anchor.set(0.5);
                s.x = b.x;
                s.y = b.y;
                s.texture = this.screen.ascii[256];
                s.height = b.h * 2;
                s.width = b.w * 2;
                s.rotation = rot
                s.tint = 0xc8c8c8;
                s.alpha = 0.5;

                s = this.screen.next();
                s.anchor.set(0.5);
                s.x = b.x;
                s.y = b.y;
                s.texture = this.screen.ascii[256];
                s.height = (b.h - 1) * 2;
                s.width = (b.w - 1) * 2;
                s.rotation = rot;
                s.tint = color;
                s.alpha = 0.5;


            }
        }
      
        

        this.screen.text(0, -16, `Cursor Willy`);
        
        this.drawCursor();

        this.screen.end();

        requestAnimationFrame(this.update.bind(this));
    }


}