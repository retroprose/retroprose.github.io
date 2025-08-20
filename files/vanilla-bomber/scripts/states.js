class SelectRoom {

    constructor(input, output, result) {
        this.input = input;
        this.output = output;
        this.result = result;
        this.next = undefined;
        this.selected = 0;
        
        this.keyDown = this.keyDown.bind(this);
        window.addEventListener('keydown', this.keyDown);

    }

    dispose() {
        window.removeEventListener('keydown', this.keyDown);
    }

    keyDown(event) {
        if (event.key === 'ArrowUp') {
            if (this.selected > 0) {
                this.selected--;
            } else {
                this.selected = 10;
            }
        } else if (event.key === 'ArrowDown') {
            if (this.selected < 10) {
                this.selected++;
            } else {
                this.selected = 0;
            }
        } else if (event.key === 'Enter') {
            if (this.selected < 10) {
                this.next = "ConnectedState";
                this.result = this.selected.toString();
            } else {
                this.next = "OfflineState";
                this.result = '10';
            }    
        }
    }

    update(delta) {
        let xOffset = 276;
        let yOffset = 132;

        this.output.reset();
        this.output.text(xOffset, yOffset, "Use arrow keys to select and enter to accept choice");
        let y = 32;
        for (let i = 0; i < 10; ++i) {
            this.output.text(19 * 8 + xOffset, y + yOffset, "Enter Room " + i.toString());
            y += 24;
        }
        this.output.text(19 * 8 + xOffset, y + yOffset, "Play Offlne");
        
        // shows selection
        y = this.selected * 24 + 32;
        this.output.text(19 * 8 - 32 + xOffset, y + yOffset, ">>>");
        this.output.text(32 * 8 + xOffset, y + yOffset, "<<<");        

        this.output.complete();
    }

}


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
                this.inputBuffer[4] = 1;
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



class ConnectedState {

    constructor(input, output, result) {
        this.input = input;
        this.output = output;
        this.result = result;
        this.next = undefined;

        this.running = false;
        this.socketClosed = false;
        this.socketOpened = false;

        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
        this.message = this.message.bind(this);

        this.socket = new WebSocket("wss://go-gin-web-server-32.onrender.com/session/" + this.result);
        this.socket.binaryType = "arraybuffer";

        this.socket.addEventListener("open", this.open);
        this.socket.addEventListener("close", this.close);
        this.socket.addEventListener("message", this.message);
    
        this.local = -1;
        this.buffer = new Uint8Array(8);
        this.bufferQueue = 0;
        this.queue = [];

        // set up player input
        this.playerInput = new Uint8Array(268);
        this.dropped = new Array(32);
        for (let i = 0; i < this.dropped.length; ++i) {
            this.dropped[i] = false;
        }

        this.state = undefined;
        this.factory = [ Lobby, BomberIO ];
        this.stateCounter = 0;

        this.MAX_FORWARD = 4;
        this.lastTicks = 0;
        this.waitTime = 0;
        this.frameSkip = 0;
        this.firstFrame = true;

    }
    
    dispose() {
        // clean up listeners
        this.socket.close();
        this.socket.removeEventListener("open", this.open);
        this.socket.removeEventListener("close", this.close);
        this.socket.removeEventListener("message", this.message);
    }

    open(event) {
        console.log("Connection Opened");
        this.socketOpened = true;
    }

    close(event) {
        this.socketClosed = true;
    }

    message(event) {
        //console.log("Message from server ", event.data);
        if (event.data instanceof ArrayBuffer) {
            if (event.data.byteLength == 1) {
                // first message set the slot player connected to
                this.local = new Uint8Array(event.data)[0];            
            } else {
                // add to queue of ArrayBuffers
                //console.log(event.data.byteLength);
                this.queue.push(new Uint8Array(event.data));
            }
        }
    }

    sendInput(delta) {
        if (this.socketOpened) {
            this.waitTime += delta;
            if (this.waitTime > 33) {
                this.waitTime -= 33;
                if (this.frameSkip > 0) {
                    --this.frameSkip;
                } else {
                    if (this.bufferQueue < this.MAX_FORWARD) {
                        // send it!
                        this.socket.send(this.buffer);                        
                        this.bufferQueue++;
                    }
                }
            }
        }
    }

    pop_input() {
        let data = this.queue.shift();
        if (data) {
            this.playerInput = data
            let broken = 0;
            for (let i = 0; i < 4; ++i) {
                // the packet offset to the dropped flags is 8
                broken |= data[8 + i] << (i * 8);
            }
            for (let n = 0; n < this.dropped.length; ++n) {
                this.dropped[n] = (broken & (0x1 << n)) != 0x0;
            } 
        }
    }

    update(deltaQ) {
        if (this.firstFrame) {
            this.lastTicks = deltaQ;
            this.firstFrame = false;
        }

        // I may need to fix this
        let delta = deltaQ - this.lastTicks;
        this.lastTicks = deltaQ;

        // if explicit quit or socket closes for any reason
        if (this.input['Delete'] || this.socketClosed) {
            this.next = "SelectRoom";
            this.result = "Error";
            return;
        }

        if (this.state) {
            this.state.processInput(this.buffer);
        }

        if (!this.running) {
            // we are waiting to recieve the first packet we got that has our input in it
            this.sendInput(delta);
            while (this.queue.length > 0) {
                this.pop_input();
                if (this.local != -1) {
                    if (this.dropped[this.local] == false) {
                        if (this.bufferQueue > 0) {
                            this.bufferQueue--;
                        }
                        this.state = new this.factory[this.stateCounter](this.input, this.output, this.local);
                        this.state.network(this.playerInput);
                        this.running = true;
                    }
                }
            }

            this.output.reset();
            this.output.text(396, 266, "Waiting to connect...");
            this.output.complete();

        } else {
            this.sendInput(delta);
            while (this.queue.length > 0) {
                this.pop_input();   
                if (this.dropped[this.local] == false) {
                    if (this.bufferQueue > 0) {
                        this.bufferQueue--;
                    }
                } else {
                    ++this.frameSkip;
                }

                if (this.state) {

                    this.state.network(this.playerInput);
                    this.state.update();
                    let ending = this.state.update();

                    if (ending == true) {
                        this.state.dispose();
                        ++this.stateCounter;
                        if (this.stateCounter >= this.factory.length) {
                            this.stateCounter = 0;
                        }
                        this.state = new this.factory[this.stateCounter](this.input, this.output, this.local);
                        this.state.network(this.playerInput);
                    }
                }
            }
            if (this.state) {
                this.state.render();
            }

        }
        
    }

}