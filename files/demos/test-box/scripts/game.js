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
        this.screen = new Screen(960, 540);
        
        this.input.screen = this.screen;

        this.addChild(this.screen);
        this.addChild(this.input);

        this.resetInput();
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

        this.bindInput.x = 0;
        this.bindInput.y = 0;
    }

    updateDelta(delta) {
        this.input.update(delta);

        if (this.input.keyState['ArrowLeft'])    {this.bindInput.left = true;}
        if (this.input.keyState['ArrowRight'])   {this.bindInput.right = true;}
        if (this.input.keyState['ArrowUp'])    {this.bindInput.up = true;}
        if (this.input.keyState['ArrowDown'])   {this.bindInput.down = true;}

        if (this.input.keyState['x'])       {this.bindInput.x = true;}
        if (this.input.keyState['z'])       {this.bindInput.y = true;}
        if (this.input.keyState[' '])       {this.bindInput.a = true;}

        // touch jump
        if (this.input.touchDown)           {this.bindInput.b = true;}
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
        let dx = x1 - x0;
        let dy = y1 - y0;
        let s = this.screen.next();
        s.anchor.set(0.0);
        s.texture = this.pixel;
        s.alpha = 1.0;
        s.tint = c;
        s.x = x0;
        s.y = y0;
        s.rotation = Math.atan2(dy, dx);
        s.width = Math.sqrt(dx * dx + dy * dy);
        s.height = 1.0;
    }
 
    box(x, y, w, h, c=0xffffff) {
        this.line(x, y, x + w, y, c);
        this.line(x, y, x, y + h, c);
        this.line(x + w, y, x + w, y + h, c);
        this.line(x, y + h, x + w, y + h, c);
    }

    beveled(x, y, w, h, b, c=0xffffff) {
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

    render() {
        if (!this.pixel) { return; }
        this.screen.begin();
        this.game.render(this);
        this.screen.end();
    }



}