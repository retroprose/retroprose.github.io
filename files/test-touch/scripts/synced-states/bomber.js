class BomberIO {

    constructor(input, output, local) {
        this.input = input;
        this.output = output;
        this.local = local;
    
        this.game = new Module.BindGame();
        this.entity = new Module.BindEntity();
        this.bindInput = new Module.BindInput();
    }

    dispose() {
        this.game.delete();
        this.entity.delete();
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

        for (const gamepad of navigator.getGamepads()) {
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
        }

        this.game.getInput(this.bindInput, buffer);
    }

    update() {
        return this.game.update();
    }

    render() {
        this.output.reset();

        let entity = this.entity;

        this.game.findLocal(this.local);
        entity.begin(this.game);
        while ( entity.next() ) {
            let s = this.output.next();
            s.x = entity.position_x;
            s.y = entity.position_y;
            s.texture = this.output.pixelTexture;
            if (entity.handle == this.game.localHandle()) {
                // center screen to local player, and make different color
                this.output.stage.x = -entity.position_x + 480;
                this.output.stage.y = -entity.position_y + 270;
                s.tint = 0x000000ff;                
            } else {
                s.tint = entity.color;
            }
            s.width = entity.size_x;
            s.height = entity.size_y;
        }
        
        this.output.complete();
    }



}