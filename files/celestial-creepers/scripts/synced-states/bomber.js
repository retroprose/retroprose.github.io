class BomberIO extends PIXI.Container {

    constructor(local) {
        super();

        this.pixel = undefined;
        PIXI.Assets.load('../images/white-pixel.png').then((texture) => {
            this.pixel = texture;
        });

        this.local = local;

        this.game = new Module.BindGame();
        this.entity = new Module.BindRenderable();
        this.bindInput = new Module.BindInput();

        this.input = new InputSliders();
        this.screen = new Screen(960, 540);

        this.addChild(this.screen);
        this.addChild(this.input);
    }

    destroy() {
        super.destroy();
        this.game.delete();
        this.entity.delete();
        this.bindInput.delete();
    }

    resize() {
        this.input.resize();
        this.screen.resize();
    }

    network(playerInput) {
        this.game.setInput(playerInput);
    }

    processInput(buffer) {

        this.bindInput.up = false;
        this.bindInput.down = false;
        this.bindInput.left = false;
        this.bindInput.right = false;
        this.bindInput.bomb = false;
        this.bindInput.punch = false;
        this.bindInput.kick = false;
        this.bindInput.detonate = false;

        // int16_t range: -32,768 to 32,767
        // let slope = 1.0 * (output_end - output_start) / (input_end - input_start);
        // round: return floor(d + 0.5);
        // output = output_start + round(slope * (input - input_start));
        //let slope = 1.0 * (32767 - -32768) / (1.0 - -1.0);
        let slope = 1.0 * (32767 - -32767) / (32767);

        /*for (const gamepad of navigator.getGamepads()) {
            if (!gamepad) continue;
            if (gamepad.buttons.length < 16) continue;

            this.bindInput.x = -32767 + slope * (gamepad.axes[0] - -1.0);
            this.bindInput.y = -32767 + slope * (gamepad.axes[1] - -1.0);

            if (gamepad.buttons[12].pressed) this.bindInput.up = true;
            if (gamepad.buttons[13].pressed) this.bindInput.down = true;
            if (gamepad.buttons[14].pressed) this.bindInput.left = true;
            if (gamepad.buttons[15].pressed) this.bindInput.right = true;

            if (gamepad.buttons[1].pressed) this.bindInput.bomb = true;
            if (gamepad.buttons[2].pressed) this.bindInput.punch = true;
            if (gamepad.buttons[3].pressed) this.bindInput.kick = true;
            if (gamepad.buttons[0].pressed) this.bindInput.detonate = true;
        }*/

        this.bindInput.x = 0;
        this.bindInput.y = 0;

        /*if (this.input.keyState['w']) this.bindInput.y = -32767;
        if (this.input.keyState['s']) this.bindInput.y = 32767;
        if (this.input.keyState['a']) this.bindInput.x = -32767;
        if (this.input.keyState['d']) this.bindInput.x = 32767;*/

        this.bindInput.x = -32767 + slope * (this.input.left);
        this.bindInput.y = -32767 + slope * (this.input.right);

        if (this.buttonState == 1) this.bindInput.bomb = true;

        this.game.getInput(this.bindInput, buffer);

    }

    update() {
        return this.game.update();
    }

    render() {
        if (!this.pixel) { return; }

        this.screen.begin();

        let entity = this.entity;

        let sx = Math.floor(-this.screen.container.x / 16);
        let sy = Math.floor(-this.screen.container.y / 16);
        let ex = sx + Math.floor(960 / 16) + 1;
        let ey = sy + Math.floor(540 / 16) + 1;

        if (sx < 0) sx = 0;
        if (sy < 0) sy = 0;
        if (ex >= 512) ex = 511;
        if (ey >= 512) ey = 511;

        // render the tile map
        for (let row = sy; row <= ey; ++row)
        {
            for (let col = sx; col <= ex; ++col)
            { 
                const t = this.game.getTile(col, row);
                if (t == 1) {
                    let s = this.screen.next();
                    s.x = col * 16;
                    s.y = row * 16;
                    s.texture = this.pixel;
                    s.tint = 0xc8c8c8;
                    s.width = 16;
                    s.height = 16;
                }
            }
        }

        this.game.findLocal(this.local);
        entity.begin(this.game);
        while ( entity.next() ) {
            let s = this.screen.next();
            s.x = entity.position_x;
            s.y = entity.position_y;
            s.texture = this.pixel;
            if (entity.handle == this.game.localHandle()) {
                // center screen to local player, and make different color
                this.screen.scroll(-entity.position_x + 480, -entity.position_y + 270);
                s.tint = 0x000000ff;                
            } else {
                s.tint = entity.color;
            }
            s.width = entity.size_x;
            s.height = entity.size_y;
        }
        
        this.screen.end();
    }



}