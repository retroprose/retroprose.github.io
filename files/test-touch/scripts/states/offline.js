



class OfflineState {

    constructor(input, output, result) {
        this.input = input;
        this.output = output;
        this.result = result;
        this.next = undefined;

        this.tickCounter = 0;
        this.lastTicks = 0;
        this.framealt = true;
        this.firstFrame = true;

        this.buffer = new Uint8Array(8);

        this.inputBuffer = new Uint8Array(268);

        this.state = new BomberIO(this.input, this.output, 0);
    }

    dispose() {
        this.state.dispose();
    }

    update(deltaQ) {
        if (this.firstFrame) {
            this.lastTicks = deltaQ;
            this.firstFrame = false;
        }

        // if explicit quit
        if (this.input['Delete']) {
            this.next = "SelectRoom";
            this.result = "Error";
            return;
        }

        let delta = deltaQ - this.lastTicks;
        this.lastTicks = deltaQ;

        this.tickCounter += delta;

        this.state.processInput(this.buffer);

        while (this.tickCounter >= 17) {
            this.tickCounter -= 17;

            if (this.framealt == true) {
                // make a random number
                this.inputBuffer[0] = Math.floor(Math.random() * 256);
                this.inputBuffer[1] = Math.floor(Math.random() * 256);
                this.inputBuffer[2] = Math.floor(Math.random() * 256);
                this.inputBuffer[3] = Math.floor(Math.random() * 256);
                // set slot 0 to connected
                //this.inputBuffer[4] = 1;
                this.inputBuffer[4] = 0xff;
                this.inputBuffer[5] = 0xff;
                // set input to the buffer
                for (let i = 0; i < 8; ++i) {
                    this.inputBuffer[12 + i] = this.buffer[i];
                }
            }
            this.framealt = !this.framealt;
        
            this.state.network(this.inputBuffer);
            let ending = this.state.update();

            if (ending) {
                // Do ending restart logic here!
                this.next = 'SelectRoom';
                this.result = 'Done';
            }

            this.state.render();
        }
    }


}
