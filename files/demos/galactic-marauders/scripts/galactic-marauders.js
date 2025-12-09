class GalacticMaraudersIO extends PIXI.Container {

    constructor(local) {
        super();

        this.pixel = undefined;
        PIXI.Assets.load('../shared/images/white-pixel.png').then((texture) => {
            this.pixel = texture;
        });

        this.texture = undefined;
        PIXI.Assets.load('./images/invaders-sprite.json').then((texture) => {
            this.texture = texture;
        });

        this.backslashLastPress = false;

        this.game = new Module.BindGame();
        this.bindInput = new Module.BindInput();

        this.local = local;
        this.game.setLocal(this.local);

        this.input = new InputStick();
        this.screen = new Screen(960*2, 540*2);

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

        if (this.input.keyState['\\'] && this.backslashLastPress == false) {
            this.input.visible = !this.input.visible;
        }
        this.backslashLastPress = this.input.keyState['\\'];

        this.bindInput.left = false;
        this.bindInput.right = false;
        this.bindInput.primary = false;

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

        if (this.input.keyState['ArrowLeft']) this.bindInput.left = true;
        if (this.input.keyState['ArrowRight']) this.bindInput.right = true;
        if (this.input.keyState[' ']) this.bindInput.primary = true;

        if (this.input.stickStateX > 0.0) this.bindInput.right = true;
        if (this.input.stickStateX < 0.0) this.bindInput.left = true;
        if (this.input.buttonState == 1) this.bindInput.primary = true;

        this.game.getInput(this.bindInput, buffer);

    }

    update() {
        return this.game.update();
    }


    render() {
        if (!this.pixel || ! this.texture) { return; }

        this.screen.begin();

        // scroll screen to camera position
        this.screen.scroll(-this.game.getCameraX() + this.screen.desiredWidth / 2, -this.game.getCameraY() + this.screen.desiredHeight / 2);

        let list = this.texture.textures;

        this.game.begin();
        while ( this.game.next() ) {
            let s = this.screen.next();
            s.anchor.set(0.5);
            s.texture = list[this.game.frame];
            s.x = this.game.position_x;
            s.y = this.game.position_y;
            s.scale.set(this.game.size_x);
        }
        
        this.screen.end();
    }


}