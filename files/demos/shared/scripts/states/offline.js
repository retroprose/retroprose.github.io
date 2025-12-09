class OfflineState extends PIXI.Container {

    constructor(data) {
        super();
        
        this.data = data;
        this.returned = false;

        this.tickCounter = 0;
        this.lastTicks = 0;
        this.framealt = true;
        this.firstFrame = true;

        this.buffer = new Uint8Array(8);

        this.inputBuffer = new Uint8Array(268);

        //this.state = new GameIO(0);
        this.state = new window.factory[window.factory.length - 1](0);
        this.addChild(this.state);

        this.endGame = this.endGame.bind(this);
        window.addEventListener("keydown", this.endGame);
    }

    destroy() {
        super.destroy();
        window.removeEventListener("keydown", this.endGame);
    }

    resize() {
        this.state.resize();
    }

    endGame(event) {
        if (event.key == 'Delete') {
            this.returned = {
                next: 'SelectState'
            };
        }
    }

    update(deltaQ) {
        if (this.firstFrame) {
            this.lastTicks = deltaQ;
            this.firstFrame = false;
        }

        // if explicit quit
        //if (this.input['Delete']) {
        //    this.next = "SelectRoom";
        //    this.result = "Error";
        //    return;
        //}

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
                this.inputBuffer[6] = 0xff;
                this.inputBuffer[7] = 0xff;
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
                this.returned = {
                    next: 'SelectState'
                };
            }

            this.state.render();
        }
    }


}
