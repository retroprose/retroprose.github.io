class GameIO extends PIXI.Container {

    constructor(local) {
        super();

        this.ascii = undefined;
        PIXI.Assets.load('../shared/images/tilemap-sprite.json').then((texture) => {
            this.ascii = [];
            for (const key in texture.textures) {
                this.ascii[parseInt(key)] = texture.textures[key];
            }
        });

        this.pixel = undefined;
        PIXI.Assets.load('../shared/images/white-pixel.png').then((texture) => {
            this.pixel = texture;
        });

        this.spriteMap = undefined;
        PIXI.Assets.load('./images/sprite.json').then((texture) => {
            this.animationCount = [ 11, 12, 7, 6, 5, 1, 1 ];
            this.spriteMap = [];
            var index = 0;
            for (var k in texture.textures) {
                this.spriteMap[index] = texture.textures[k];
                ++index;
            }
        });

        this.local = local;

        this.bindInput = new Module.BindInput();
        this.game = new Module.BindGame();
        this.game.setLocal(this.local);
        this.game.load(window.load_default);

        this.background = new PIXI.Graphics();
        this.addChild(this.background);

        this.input = new GameInput();
        this.screen = new GameScreen(720, 405);
        this.hud = new GameHud();
        
        this.input.screen = this.screen;

        this.addChild(this.screen);
        this.addChild(this.input);
        this.addChild(this.hud);

        this.resetInput();

        this.screenTransformData = {
            x: 0.0,
            y: 0.0,
            r: 0.0,
            z: 1.0
        };
    }

    destroy() {
        super.destroy();
        this.game.delete();
        this.bindInput.delete();
    }

    resize() {
        this.background.clear(); 
        this.background.beginFill(0x4c4c4c); 
        this.background.drawRect(0, 0, window.innerWidth, window.innerHeight); 
        this.background.endFill();
        this.input.resize();
        this.screen.resize();
    }

    network(playerInput) {
        this.game.setInput(playerInput);
    }

    processInput(buffer) {
        this.game.getInput(this.bindInput, buffer);
        this.resetInput();
    }

    resetInput() {
        this.bindInput.up = false;
        this.bindInput.down = false;
        this.bindInput.left = false;
        this.bindInput.right = false;
        this.bindInput.a = false;
        this.bindInput.b = false;
        this.bindInput.x = false;
        this.bindInput.y = false;

        this.bindInput.angle = 0;
        this.bindInput.axisX = 0;
        this.bindInput.axisY = 0;
    }

    updateDelta(delta) {
        this.input.update(delta);

        //console.log("ltime: " + this.input.left.timer + ", rtime: " + this.input.right.timer + "left: " + this.input.left.current + ", right: " + this.input.right.current + ", dpress: " + this.input.doublePress + ", dtap: " + this.input.doubleTap);
        //console.log("left: " + this.input.left.current + ", right: " + this.input.right.current + ", dpress: " + this.input.doublePress + ", dtap: " + this.input.doubleTap);

        if (this.input.left.visible)    {this.bindInput.left = true;}
        if (this.input.right.visible)   {this.bindInput.right = true;}
        if (this.input.a.visible)       {this.bindInput.a = true;}
        if (this.input.b.visible)       {this.bindInput.b = true;}

        //if (this.input.left.current)    {this.bindInput.left = true;}
        //if (this.input.right.current)   {this.bindInput.right = true;}
        //if (this.input.doublePress)     {this.bindInput.x = true;}
        //if (this.input.doubleTap)       {this.bindInput.a = true;}


        /*if (this.input.left)    {this.bindInput.left = true;}
        if (this.input.right)   {this.bindInput.right = true;}

        if (this.input.keyState['ArrowLeft'])    {this.bindInput.left = true;}
        if (this.input.keyState['ArrowRight'])   {this.bindInput.right = true;}
        if (this.input.keyState['ArrowUp'])      {this.bindInput.up = true;}
        if (this.input.keyState['ArrowDown'])   {this.bindInput.down = true;}*/

        //if (this.input.keyState['x'])       {this.bindInput.x = true;}
        //if (this.input.keyState['z'])       {this.bindInput.y = true;}
        //if (this.input.keyState[' '])       {this.bindInput.a = true;}

        // touch jump
        //if (this.input.touchDown)           {this.bindInput.b = true;}
    }

    update() {
        return this.game.fixedUpdate();
    }

    draw(o) {
        let s = this.screen.next();
        s.anchor.set(o.ax, o.ay);
        s.scale.set(o.sx, o.sy);
        s.texture = this.spriteMap[o.i];
        s.alpha = o.a;
        s.tint = o.c;
        s.x = o.px;
        s.y = o.py;
        s.rotation = o.r;
    }

    draw_thing(o) {
        let s = this.screen.next();
        s.anchor.set(0.5);
        s.texture = this.pixel;
        s.alpha = o.a;
        s.tint = o.c;
        s.x = o.px;
        s.y = o.py;
        s.rotation = o.r;
        s.width = o.sx;
        s.height = o.sy;
    }

    line(x0, y0, x1, y1, c=0xffffff) {
        //let t = 0.2;
        let t = 1.0 / this.screenTransformData.z;
        let dx = x1 - x0;
        let dy = y1 - y0;
        let s = this.screen.next();
        s.anchor.set(0.5);
        s.texture = this.pixel;
        s.alpha = 1.0;
        s.tint = c;
        s.x = (x1 + x0) / 2.0;
        s.y = (y1 + y0) / 2.0;
        s.rotation = Math.atan2(dy, dx);
        s.width = Math.sqrt(dx * dx + dy * dy) + t;
        s.height = t;
    }

    rbox(x, y, w, h, r, c=0xffffff) {
        let s = this.screen.next();
        s.anchor.set(0.5);
        s.alpha = 1.0;
        s.tint = c;
        s.x = x;
        s.y = y;
        s.rotation = r;
        s.texture = this.pixel;
        s.width = w;
        s.height = h;
    }

    sbox(x, y, w, h, c=0xffffff) {
        let s = this.screen.next();
        s.anchor.set(0.0);
        s.alpha = 1.0;
        s.tint = c;
        s.x = x;
        s.y = y;
        s.rotation = 0.0;
        s.texture = this.pixel;
        s.width = w;
        s.height = h;
    }

    box(x, y, w, h, c=0xffffff) {
        this.line(x, y, x + w, y, c);
        this.line(x, y, x, y + h, c);
        this.line(x + w, y, x + w, y + h, c);
        this.line(x, y + h, x + w, y + h, c);
    }

    text2(sx, sy, text, c=15) {
        if (!this.ascii) return;
        let x = sx - 8;
        let y = sy - 8;
        for (let i = 0; i < text.length; ++i) {
            if (text.charAt(i) == '\n') {
                x = sx;
                y += 4;
            } else {
                let s = this.screen.next();
                
                s.anchor.set(0.0);
                s.scale.set(0.5);
                s.texture = this.ascii[text.charCodeAt(i) + c * 256];
                s.alpha = 1.0;
                s.tint = 0xffffff;
                s.x = x;
                s.y = y;
                s.rotation = 0.0;
                
                x += 4;
            }
        }
    }

    screenTransform(o) {
        this.screen.scroll(-o.x * o.z + this.screen.desiredWidth / 2, -o.y * o.z + this.screen.desiredHeight / 2);
        this.screen.rotate(o.r);
        this.screen.zoom(o.z);
    }

    text(str) {
        this.hud.text(0, 0, str);
    }

    render() {
        if (!this.pixel || !this.spriteMap || !this.ascii) { return; }
        this.hud.begin();
        this.screen.begin();
        this.game.render(this);
        this.screen.end();
        this.hud.end();
    }



}