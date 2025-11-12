class SportIO extends PIXI.Container {

    constructor(local) {
        super();

        this.pixel = undefined;
        PIXI.Assets.load('../images/white-pixel.png').then((texture) => {
            this.pixel = texture;
        });

        this.game = new Module.BindGame();
        this.bindInput = new Module.BindInput();

        this.local = local;
        this.game.setLocal(this.local);

        this.screen = new Screen(540, 960);
        this.input = new SportInput();
        this.input.setContainer(this.screen.container);

        this.xOffset = 0.0;
        this.yOffset = 0.0;
        
        this.addChild(this.screen);
        this.addChild(this.input);
    }

    destroy() {
        super.destroy();
        this.game.delete();
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
        let slope = 1.0 * (32767 - -32767) / (1.0 - -1.0);

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

        //this.bindInput.x = -32767 + slope * (this.input.stickStateX - -1.0);
        //this.bindInput.y = -32767 + slope * (this.input.stickStateY - -1.0);

        this.bindInput.x = Math.floor(this.input.xPos);
        this.bindInput.y = Math.floor(this.input.yPos);

        //console.log("x: " + this.input.xPos + ", " + "y: " + this.input.yPos);

        if (this.input.touchDown == true) this.bindInput.bomb = true;
        if (this.input.pressedThisFrame == true) this.bindInput.kick = true;

        this.game.getInput(this.bindInput, buffer);
    }

    update() {
        this.input.update();
        if (this.input.pressedThisFrame == true) {
            //this.xOffset = this.game.getCameraX() - this.input.xPos;
            //this.yOffset = this.game.getCameraY() - this.input.yPos;
            this.xOffset = this.input.xPos - (this.game.getCameraX() - this.xOffset);
            this.yOffset = this.input.yPos - (this.game.getCameraY() - this.yOffset);
        
            //this.xOffset = 270.0;
            //this.yOffset = 480.0;
        
        }
        return this.game.update();    
    }


    render() {
        if (!this.pixel) { return; }

        this.screen.begin();

        // scroll screen to camera position
        //this.screen.scroll(-this.game.getCameraX() + 270, -this.game.getCameraY() + 480);
        this.screen.scroll(-this.game.getCameraX() + this.xOffset, -this.game.getCameraY() + this.yOffset);

        this.game.begin();

        let s = this.screen.next();
        s.anchor.set(0.5);
        s.alpha = 1.0;
        s.texture = this.pixel;
        s.tint = 0x00c800;
        s.x = this.game.getCameraX() - this.xOffset + 270;
        s.y = this.game.getCameraY() - this.yOffset + 480;
        s.width = 540.0;
        s.height = 960.0;
        s.rotation = 0.0;

        while ( this.game.next() ) {
            let s = this.screen.next();
            s.anchor.set(0.5);
            s.alpha = 1.0;
            s.texture = this.pixel;
            s.tint = this.game.color;
            s.x = this.game.position_x;
            s.y = this.game.position_y;
            s.width = this.game.size_x;
            s.height = this.game.size_y;
            s.rotation = this.game.rotation;
        }

        this.screen.text(this.game.getCameraX(), this.game.getCameraY(), "" + this.xOffset + ", " + this.yOffset);

        this.screen.end();
    }


}