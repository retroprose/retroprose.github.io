class Lobby {

    constructor(input, output, local) {
        this.input = input;
        this.output = output;
        this.local = local;

        // player input
        this.playerInput = new Uint8Array(268);
        this.connected = new Array(32);
        for (let i = 0; i < this.connected.length; ++i) {
            this.connected[i] = false;
        }

    }

    dispose() {

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

        if (this.input['ArrowUp']) b |= (1 << 0);
        if (this.input['ArrowDown']) b |= (1 << 1);
        if (this.input['ArrowLeft']) b |= (1 << 2);
        if (this.input['ArrowRight']) b |= (1 << 3);

        if (this.input['v']) b |= (1 << 4);
        if (this.input['c']) b |= (1 << 5);
        if (this.input[' ']) b |= (1 << 6);
        if (this.input['b']) b |= (1 << 7);

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

        // this is checking the space key
        if ((this.playerInput[12 + host * 8 + 4] & (1 << 6)) == (1 << 6)) {
            return true;
        }

        return false;
    }

    render() {

        this.output.reset();

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

                if (( b & (1 << 0)) == (1 << 0)) this.output.text(x+=8, y, "U");
                if (( b & (1 << 1)) == (1 << 1)) this.output.text(x+=8, y, "D");
                if (( b & (1 << 2)) == (1 << 2)) this.output.text(x+=8, y, "L");
                if (( b & (1 << 3)) == (1 << 3)) this.output.text(x+=8, y, "R");

                if (( b & (1 << 4)) == (1 << 4)) this.output.text(x+=8, y, "V");
                if (( b & (1 << 5)) == (1 << 5)) this.output.text(x+=8, y, "C");
                if (( b & (1 << 6)) == (1 << 6)) this.output.text(x+=8, y, "S");
                if (( b & (1 << 7)) == (1 << 7)) this.output.text(x+=8, y, "B");

                if (j == this.local) {
                    let keyX = 28 * 8 + 20;
                    if (this.input['ArrowUp']) this.output.text(keyX+=8, y, "U");
                    if (this.input['ArrowDown']) this.output.text(keyX+=8, y, "D");
                    if (this.input['ArrowLeft']) this.output.text(keyX+=8, y, "L");
                    if (this.input['ArrowRight']) this.output.text(keyX+=8, y, "R");

                    if (this.input[' ']) this.output.text(keyX+=8, y, "V");
                    if (this.input['c']) this.output.text(keyX+=8, y, "C");
                    if (this.input['v']) this.output.text(keyX+=8, y, "S");
                    if (this.input['b']) this.output.text(keyX+=8, y, "B");
                }

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

        this.output.complete();

    }


}