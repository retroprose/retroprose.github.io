class GameIO extends PIXI.Container {

    constructor(local) {
        super();

        this.pixel = undefined;
        PIXI.Assets.load('../shared/images/white-pixel.png').then((texture) => {
            this.pixel = texture;
        });

        this.local = local;

        this.bindInput = new Module.BindInput();
        this.game = new Module.BindGame();
        this.game.setLocal(this.local);
        this.game.load(window.load_default);

        this.background = new PIXI.Graphics();
        this.addChild(this.background);

        this.input = new GameInput();
        this.screen = new GameScreen(400, 400);
        this.hud = new GameHud();
        
        this.input.screen = this.screen;

        this.addChild(this.screen);
        this.addChild(this.input);
        this.addChild(this.hud);

        this.resetInput();

        this.manualCam = false;
        window.addEventListener('keydown', (event) => {
            if (event.key == 'c') {
                this.manualCam = !this.manualCam;
            }
        });
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

        if (this.input.keyState['ArrowUp'])       {this.screenTransformData.y -= 1;}
        if (this.input.keyState['ArrowDown'])       {this.screenTransformData.y += 1;}
        if (this.input.keyState['ArrowLeft'])       {this.screenTransformData.x -= 1;}
        if (this.input.keyState['ArrowRight'])       {this.screenTransformData.x += 1;}
        if (this.input.keyState['z'])       {this.screenTransformData.z = this.screenTransformData.z / 1.1;}
        if (this.input.keyState['x'])       {this.screenTransformData.z = this.screenTransformData.z * 1.1;}
        //if (this.input.keyState['c'])       {this.manualCam = !this.manualCam;}

        const id = this.input.left.pointerId;
        if (id != undefined) {
            let slope = 1.0 * (32767 - -32767) / (1.0 - -1.0);
            this.bindInput.axisX = -32767 + slope * (this.input.list[id].dx - -1.0);
            this.bindInput.axisY = -32767 + slope * (this.input.list[id].dy - -1.0);
            this.bindInput.a = true;
        } else {
            let movex = 0;
            let movey = 0;
            if (this.input.keyState['w'])   {movey = -1;}
            if (this.input.keyState['s'])   {movey =  1;}
            if (this.input.keyState['a'])   {movex = -1;}
            if (this.input.keyState['d'])   {movex =  1;}
            let len = Math.sqrt(movex * movex + movey * movey);
            // console.log(movex + ", " + movey + " - " + len);
            if (len > 0.0) {
                movex /= len;
                movey /= len;
                let slope = 1.0 * (32767 - -32767) / (1.0 - -1.0);
                this.bindInput.axisX = -32767 + slope * (movex - -1.0);
                this.bindInput.axisY = -32767 + slope * (movey - -1.0);
                this.bindInput.a = true;
            }
        }

        const rid = this.input.right.pointerId;
        if (rid != undefined) {
            let slope = 1.0 * (32767 - -32767) / (Math.PI - -Math.PI);
            let angle = 0;
            if (!(this.input.list[rid].dx == 0 && this.input.list[rid].dy == 0)) {
                angle = Math.atan2(this.input.list[rid].dy, this.input.list[rid].dx);
            }
            this.bindInput.angle = -32767 + slope * (angle - -Math.PI);
            this.bindInput.b = true;
        } else {
            if (this.input.mouseButton) {
                let firex = this.input.mouseX - this.screen.desiredWidth / 2.0;
                let firey = this.input.mouseY - this.screen.desiredHeight / 2.0;
                let slope = 1.0 * (32767 - -32767) / (Math.PI - -Math.PI);
                let angle = 0;
                if (!(firex == 0 && firey == 0)) {
                    angle = Math.atan2(firey, firex);
                }
                this.bindInput.angle = -32767 + slope * (angle - -Math.PI);
                this.bindInput.b = true;
            }
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

    screenTransform(o) {
        this.screen.scroll(-o.x * o.z + this.screen.desiredWidth / 2, -o.y * o.z + this.screen.desiredHeight / 2);
        this.screen.rotate(o.r);
        this.screen.zoom(o.z);
    }

    text(str) {
        this.hud.text(0, 0, str);
    }

    render() {
        if (!this.pixel) { return; }
        this.hud.begin();
        this.screen.begin();
        this.game.render(this);

        if (this.manualCam) {
            this.screenTransform(this.screenTransformData);
        }
        this.hud.text(0, 0, "Shield: " + this.game.getShield() + "\n" + "Energy: " + this.game.getEnergy());

        
        this.screen.end();
        this.hud.end();
    }



}