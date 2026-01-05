class GameIO extends PIXI.Container {

    constructor(local) {
        super();

        /*
        
        snes mario paint
        8 x 56
        256 x 224
        248 x 168
        
        this.imageBuffer = new Uint8Array(960*540*4);
        for (let i = 0; i < 960*540; ++i) {
            let stride = i * 4;
            this.imageBuffer[stride+0] = Math.random() * 256;
            this.imageBuffer[stride+1] = Math.random() * 256;
            this.imageBuffer[stride+2] = Math.random() * 256;
            //this.imageBuffer[stride+3] = 255;
        }
        this.imageTexture = PIXI.Texture.from({
            resource: this.imageBuffer,
            width: 960,
            height: 540,
            format: 'rgb8unorm'
        });*/


        this.pixel = undefined;
        PIXI.Assets.load('../shared/images/white-pixel.png').then((texture) => {
            this.pixel = texture;
        });

        this.local = local;

        this.circles = {};

        this.bindInput = new Module.BindInput();
        this.game = new Module.BindGame();
        this.game.setLocal(this.local);
        this.game.load(window.load_default);
        this.imageBuffer = this.game.getBuffer();
        console.log(this.imageBuffer);

        this.background = new PIXI.Graphics();
        this.addChild(this.background);

        this.input = new GameInput();
        this.screen = new GameScreen(960 / 2, 540 / 2);
        
        this.input.screen = this.screen;

        this.addChild(this.screen);
        this.addChild(this.input);

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

        this.bindInput.axisX = 0;
        this.bindInput.axisY = 0;
    }

    updateDelta(delta) {
        this.input.update(delta);

        if (this.input.keyState['w'])       {this.screenTransformData.y -= 1;}
        if (this.input.keyState['s'])       {this.screenTransformData.y += 1;}
        if (this.input.keyState['a'])       {this.screenTransformData.x -= 1;}
        if (this.input.keyState['d'])       {this.screenTransformData.x += 1;}
        if (this.input.keyState['q'])       {this.screenTransformData.z = this.screenTransformData.z * 1.1;}
        if (this.input.keyState['e'])       {this.screenTransformData.z = this.screenTransformData.z / 1.1;}

        const id = this.input.left.pointerId;
        if (id != undefined) {
            let slope = 1.0 * (32767 - -32767) / (1.0 - -1.0);
            this.bindInput.axisX = -32767 + slope * (this.input.list[id].dx - -1.0);
            this.bindInput.axisY = -32767 + slope * (this.input.list[id].dy - -1.0);
        }

        //if (this.input.keyState['ArrowLeft'])    {this.bindInput.left = true;}
        //if (this.input.keyState['ArrowRight'])   {this.bindInput.right = true;}
        //if (this.input.keyState['ArrowUp'])    {this.bindInput.up = true;}
        //if (this.input.keyState['ArrowDown'])   {this.bindInput.down = true;}

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

    circle(x, y, r, c=0xffffff) {
        let s = this.screen.next();
        s.anchor.set(0.5);
        s.alpha = 1.0;
        s.tint = c;
        s.x = x;
        s.y = y;
        s.rotation = 0.0;
        // circle
        let radius = Math.floor(r);
        if (!(radius in this.circles)) {
            let graphics = new PIXI.Graphics().circle(0, 0, radius).fill(0xffffff);
            this.circles[radius] = window.__PIXI_APP__.renderer.generateTexture(graphics);
            graphics.destroy();
        }
        s.texture = this.circles[radius];
        s.width = r + r;
        s.height = r + r;
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

    sbox(x, y, w, h, r, c=0xffffff) {
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

    box(x, y, w, h, c=0xffffff) {
        this.line(x, y, x + w, y, c);
        this.line(x, y, x, y + h, c);
        this.line(x + w, y, x + w, y + h, c);
        this.line(x, y + h, x + w, y + h, c);
    }

    octagon(x, y, w, h, c=0xffffff) {
        h = h / 2.0;
        w = w / 2.0;
        let s = w * Math.tan(0.3926991);s
        // top and bottom
        this.line(x - s, y - h, x + s, y - h, c);
        this.line(x - s, y + h, x + s, y + h, c);
        // left and right
        this.line(x - w, y - s, x - w, y + s, c);
        this.line(x + w, y - s, x + w, y + s, c);

        // other lines
        this.line(x - w, y - s, x - s, y - h, c);
        this.line(x + s, y - h, x + w, y - s, c);

        this.line(x + w, y + s,x + s, y + h, c);
        this.line(x - s, y + h, x - w, y + s, c);
    }

    screenTransform(o) {
        this.screen.scroll(-o.x * o.z + this.screen.desiredWidth / 2, -o.y * o.z + this.screen.desiredHeight / 2);
        this.screen.rotate(o.r);
        this.screen.zoom(o.z);
    }

    text(str) {
        this.screen.text(0, 0, str);
    }

    render() {
        if (!this.pixel) { return; }
        this.screen.begin();
        
        
        if (this.imageTexture != undefined) {
            this.imageTexture.destroy(true);
            this.imageTexture = undefined;
        }
        this.imageTexture = PIXI.Texture.from({
            resource: this.imageBuffer,
            width: 960,
            height: 540
        });


        let s = this.screen.next();
        s.anchor.set(0.0);
        s.texture = this.imageTexture;
        s.x = this.screenTransformData.x - 480;
        s.y = this.screenTransformData.y - 270;
        s.scale.set(2.0);

        
        //this.screenTransform(this.screenTransformData);
        this.game.render(this);

        

        this.screen.end();
    }



}