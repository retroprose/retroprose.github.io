class Lobby extends PIXI.Container {

    constructor(local) {
        super();
    
        this.local = local;

        // player input
        this.playerInput = new Uint8Array(268);
        this.connected = new Array(32);
        for (let i = 0; i < this.connected.length; ++i) {
            this.connected[i] = false;
        }

        this.output = new Screen(960, 540);
        this.addChild(this.output);

        this.pressed = false;
        const circle = new PIXI.GraphicsContext().circle(0, 0, 50).fill(0x00ffff);
        this.button = new PIXI.Graphics(circle);
        this.button.visible = false;
        this.button.eventMode = 'static';
        this.button.on('pointertap', () => { this.pressed = true; });
        this.addChild(this.button);
    }

    destroy() {
        super.destroy();
    }

    resize() {
        this.output.resize();
        this.button.x = window.innerWidth - this.button.width - 32;
        this.button.y = window.innerHeight - this.button.height - 32;
    }

    network(playerInput) {
        this.playerInput = playerInput;
    }

    processInput(buffer) {
        // set buffer based on pressed keys here
        /*
        KeyUp = 1U << 0,
        KeyDown = 1U << 1,
        KeyLeft = 1U << 2,
        KeyRight = 1U << 3,
        
        KeyBomb = 1U << 4,
        KeyPunch = 1U << 5,
        KeyKick = 1U << 6,
        KeyDetonate = 1U << 7,

        KeySynced = 1U << 0
        */

        let b = 0;

        if (this.pressed == true) b |= (1 << 6);

        //if (this.input['ArrowUp']) b |= (1 << 0);
        //if (this.input['ArrowDown']) b |= (1 << 1);
        //if (this.input['ArrowLeft']) b |= (1 << 2);
        //if (this.input['ArrowRight']) b |= (1 << 3);

        //if (this.input['v']) b |= (1 << 4);
        //if (this.input['c']) b |= (1 << 5);
        //if (this.input[' ']) b |= (1 << 6);
        //if (this.input['b']) b |= (1 << 7);

        for (let i = 0; i < buffer.length; ++i) {
            buffer[i] = 0;
        }
        buffer[4] = b;

    }

    update() {

        let active = 0;
        for (let i = 0; i < 4; ++i) {
            // the packet offset to the dropped flags is 8
            active |= this.playerInput[4 + i] << (i * 8);
        }
        for (let n = 0; n < this.connected.length; ++n) {
            this.connected[n] = (active & (0x1 << n)) != 0x0;
        } 

        let host = 255;
        let i = 0;
        while (host == 255 && i < this.connected.length) {
            if (this.connected[i] == true) {
                host = i;
            }
            ++i;
        }

        if (host == this.local) {
            this.button.visible = true;
        } else {
            this.button.visible = false;
        }

        // this is checking the space key
        if ((this.playerInput[12 + host * 8 + 4] & (1 << 6)) == (1 << 6)) {
            return true;
        }

        return false;
    }

    render() {

        this.output.begin();

        let host = 255;
        let i = 0;
        while (host == 255 && i < this.connected.length) {
            if (this.connected[i] == true) {
                host = i;
            }
            ++i;
        }

        let message = '';
        if (host == this.local) {
            //sprintf(tempstr, "Press any key to start");
            message = "Press spacebar to start";
        } else {
            message = "Waiting for host to start";
        }
        this.output.text(20, 0, message);

        for (let j = 0; j < this.connected.length; ++j) {
            let x = 16 * 8 + 20;
            let y = (8 * 3) + (j * 8);
            let message = '';
            
            let b = this.playerInput[12 + j * 8 + 4];

            if (this.connected[j] == true) {
                message = "Slot " + j + ": lobby";

            } else {
                message = "Slot " + j + ": open";
            }
            this.output.text(20, y, message);
        }

        this.output.text(20, 316, "Controls: ");
        
        let yPos = 316 + 24;
        
        this.output.text(20, 0 + yPos, "Up: Up Arrow Key");
        this.output.text(20, 24 + yPos, "Down: Down Arrow Key");
        this.output.text(20, 24 * 2 + yPos, "Left: Left Arrow Key");
        this.output.text(20, 24 * 3 + yPos, "Right: Right Arrow Key");
        this.output.text(300, 0 + yPos, "Place Bomb: Spacebar");
        this.output.text(300, 24 + yPos, "Punch Bomb: C Key");
        this.output.text(300, 24 * 2 + yPos, "Stop Kicked Bomb: V Key");
        this.output.text(300, 24 * 3 + yPos, "Detonate Bomb: B Key");

        this.output.end();

    }


}