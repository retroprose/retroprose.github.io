class Main {


    async init(config) {

        // initilize pixi
        this.pixi = new PIXI.Application();
        await this.pixi.init({ background: '#000000', resizeTo: window });
        document.body.appendChild(this.pixi.canvas);
        PIXI.TextureStyle.defaultOptions.scaleMode = 'nearest';		

        this.config = config;
        this.game = new Module.BindGame();

        // load textures
        this.textures = {};
        this.textures["ascii"] = (await PIXI.Assets.load('./images/sprite.json')).textures;

        let response;
        response = await fetch('./data/map.json');
        const map = await response.json();
        response = await fetch('./data/data.json');
        const global = await response.json();

        this.screen = new Screen(720, 405);
        this.pixi.stage.addChild(this.screen);

        this.otherInput = { used: false, left: {x: 0, y: 0}};
        this.input = new GameInput();
        this.input.screen = this.screen;
        this.pixi.stage.addChild(this.input);

        // system display text
        this.displayText = new PIXI.Text({
            text: 'Loading...',
            style: {
                fill: '#ffffff',
                fontSize: 24
            }
        });
        this.pixi.stage.addChild(this.displayText);

        
        // event listeners and get main loop started
        this.resize();
        window.addEventListener("resize", () => this.resize());

        window.cmd = (d) => {
            this.game.change(d);
        };

        // initalize network config
        this.displayText.text = 'Connecting to Relay Server...';
        
        if (this.config.slot > 1) {        
            this.network = new StaggeredNetwork({
                frameTime: 1000.0 / 60.0,
                server: this.config.domain.url,
                local: this.config.domain.slot,
                key: this.config.domain.key,
                playerCount: this.config.slot,
                inputSize: this.config.input,
                fastForward: this.config.user.fastForward,
                inputDelay: this.config.user.inputDelay
            });
        } else {
            this.network = new FakeNetwork({
                frameTime: 1000.0 / 60.0,
                inputSize: 5
            });
        }

        this.network.ondisconnect = () => {
            this.displayText.visible = true;
            this.displayText.text = 'Disconnected';
        };
        this.network.onlaunch = async (seed) => {
        
            // hide display text
            this.displayText.visible = false;
            this.displayText.text = 'X';
            this.displayText.x = 0;
            this.displayText.y = 0;
            this.displayText.anchor.set(0.0);

            this.game.setup({
                seed: seed,
                playerCount: this.network.config.playerCount,
                local: this.network.local,
                map: map,
                global: global
            });

            console.log("sending ready frame");
            this.network.ready(); 

            // if players is more than one, download roster

            // get the update loop started!
            this.lastTick = 0;
            requestAnimationFrame((deltaTotal) => {
                this.lastTick = deltaTotal;
                this.update(deltaTotal);
            });

        };



        // return this;
    }

    resize() {
        this.input.resize();
        this.screen.resize();
    }

    update(deltaTotal) {
        let delta = deltaTotal - this.lastTick;
        this.lastTick = deltaTotal;

        // update input
        this.input.update(delta);
        this.otherInput.used = false;
        const slope = 1.0 * (32767 - -32767) / (1.0 - -1.0);
        for (const gamepad of navigator.getGamepads()) {
            if (!gamepad) continue;
            const x = gamepad.axes[0];
            const y = gamepad.axes[1];
            const d = Math.sqrt(x * x + y * y);

            //consolelog(`${x} ${y} ${d}`);

            if (d > 0.005) {
                this.otherInput.left.x = -32767 + slope * (x - -1.0);
                this.otherInput.left.y = -32767 + slope * (y - -1.0);
                this.otherInput.used = true;
            }
        }

        if (this.input.pause) {
            this.network.tickCounter = -this.network.frameTime;
        }
        
        // true if input got sent over the network
        if (this.otherInput.used) {
            console.log(this.otherInput);
            this.game.getInput(this.otherInput, this.network.inputBuffer);
        } else {
            this.game.getInput(this.input, this.network.inputBuffer);
        }

        if (this.network.update(delta)) {
            // reset keys maybe
        }
        while (this.network.needsUpdate()) {
            this.game.setInput(this.network.frameBuffer);
            this.game.update();							
        }        
        if (this.network.needsCopy()) {							
            //this.game.copy();
        }
        while (this.network.needsFastForward()) {
            //this.game.setForwardInput(this.network.frameBuffer);
            //this.game.forward();							
        }

        // render the scene
        this.screen.begin();
        this.game.render(this);
        this.screen.end();

        requestAnimationFrame(this.update.bind(this));
    }

    screenTransform(x, y, z, r) {
        this.screen.scroll(-x * z + this.screen.desiredWidth / 2, -y * z + this.screen.desiredHeight / 2);
        this.screen.rotate(r);
        this.screen.zoom(z);
    }

    // x, y, frame, scale, color
    box(x, y, w, h, t, a, ang) {
        let sprite = this.screen.next();
        sprite.anchor.set(0.5);
        sprite.visible = true;
        sprite.texture = this.textures["ascii"][0xdb];
        sprite.x = x;
        sprite.y = y;
        sprite.width = w;
        sprite.height = h;
        sprite.rotation = ang;
        sprite.tint = t;
        sprite.alpha = a;
    }

}