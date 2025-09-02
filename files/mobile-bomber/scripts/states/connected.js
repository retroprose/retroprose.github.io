
class ConnectedState extends PIXI.Container {

    constructor(data) {
        super();

        this.data = data;
        this.returned = false;

        this.running = false;
        this.socketClosed = false;
        this.socketOpened = false;

        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
        this.message = this.message.bind(this);
        this.endGame = this.endGame.bind(this);

        this.socket = new WebSocket("wss://go-gin-web-server-32.onrender.com/session/" + this.data.room);
        this.socket.binaryType = "arraybuffer";

        this.socket.addEventListener("open", this.open);
        this.socket.addEventListener("close", this.close);
        this.socket.addEventListener("message", this.message);

        window.addEventListener('keydown', this.endGame);
    
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

        this.text = new PIXI.Text({
            text: 'Waiting to connect...',
            style: {
                fill: '#ffffff',
                fontSize: 24
            },
            anchor: 0.5
        });
        this.text.visible = true;
        this.addChild(this.text);
    }
    
    destroy() {
        super.destroy();
        // clean up listeners
        this.socket.close();
        this.socket.removeEventListener("open", this.open);
        this.socket.removeEventListener("close", this.close);
        this.socket.removeEventListener("message", this.message);
        window.removeEventListener("keydown", this.endGame);
    }

    resize() {
        this.text.x = window.innerWidth / 2;
        this.text.y = window.innerHeight / 2;
        if (this.state) {
            this.state.resize();
        }
    }

    endGame(event) {
        if (event.key == 'Delete') {
            this.returned = {
                next: 'SelectState'
            };
        }
    }

    open(event) {
        console.log("Connection Opened");
        this.socketOpened = true;
    }

    close(event) {
        console.log("Connection Closed");
        this.socketClosed = true;
        this.returned = {
            next: 'SelectState'
        };
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
                        this.state = new this.factory[this.stateCounter](this.local, {});
                        this.state.network(this.playerInput);
                        this.addChild(this.state);
                        this.state.resize();
                        this.running = true;
                    }
                }
            }
            this.text.visible = true;

        } else {
            this.text.visible = false;

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
                        let returned = this.state.returned;
                        this.removeChild(this.state);
                        this.state.destroy();
                        ++this.stateCounter;
                        if (this.stateCounter >= this.factory.length) {
                            this.stateCounter = 0;
                        }
                        this.state = new this.factory[this.stateCounter](this.local, returned);
                        this.state.network(this.playerInput);
                        this.addChild(this.state);
                        this.state.resize();
                    }
                }
            }
            if (this.state) {
                this.state.render();
            }

        }
        
    }

}