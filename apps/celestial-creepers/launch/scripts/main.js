class Main {


    async init(config) {

        // initilize pixi
        this.pixi = new PIXI.Application();
        await this.pixi.init({ background: '#000000', resizeTo: window });
        document.body.appendChild(this.pixi.canvas);
        PIXI.TextureStyle.defaultOptions.scaleMode = 'nearest';		

        this.config = config;
        this.dump = {};
        this.game = new Module.BindGame();

        this.roster = [];

        // load textures
        this.textures = {};
        this.textures["ascii"] = (await PIXI.Assets.load('./images/sprite.json')).textures;
        this.textures["space"] = (await PIXI.Assets.load('./images/creeper-sprite.json')).textures;

        this.texnames = [
            "__NULL__",
            "spaceship_0_0",
            "astro_6_1",
            "hook_0_0",
            "creeper_0_0",
            "creepernode_0_0"
        ];

        let response;
        response = await fetch('./data/map.json');
        const gameMapData = await response.json();
        response = await fetch('./data/data.json');
        const gameData = await response.json();
        // splice the map into the main game data
        gameData["systems"]["physics"]["width"] = gameMapData["width"];
        gameData["systems"]["physics"]["height"] = gameMapData["height"];
        gameData["systems"]["physics"]["data"] = gameMapData["data"];

        this.screen = new Screen(720, 405);
        this.pixi.stage.addChild(this.screen);

        this.mouseActive = false;
        this.otherInput = { 
            used: false, 
            left: {x: 0, y: 0},
            leftShot: false,
            rightShot: false
        };
        this.input = new GameInput();
        this.input.screen = this.screen;
        this.pixi.stage.addChild(this.input);

        this.screen.starsScale = 4;
        this.screen.stars2Scale = 8;

        // add stars
        let low, high;
        for (var i = 0; i < 1500; ++i) {
            let s = new PIXI.Sprite();
            s.texture = this.textures["ascii"][0xdb];
            s.tint = 0xc8c8c8;
            high = (1024 / this.screen.starsScale) * 16;
            low = -(1024 / this.screen.starsScale) * 16;
            s.x = Math.random()*(high - low + 1) + low;
            high = 128 * 16;
            low = -128 * 16;
            s.y = Math.random()*(high - low + 1) + low;
            s.width = 2;
            s.height = 2;
            this.screen.stars.addChild(s);
        }

        /*for (var i = 0; i < 750; ++i) {
            let s = new PIXI.Sprite();
            s.texture = this.textures["ascii"][0xdb];
            s.tint = 0xc8c8c8;
            high = (1024 / this.screen.stars2Scale) * 16;
            low = -(1024 / this.screen.stars2Scale) * 16;
            s.x = Math.random()*(high - low + 1) + low;
            high = 128 * 16;
            low = -128 * 16;
            s.y = Math.random()*(high - low + 1) + low;
            s.width = 2;
            s.height = 2;
            this.screen.stars2.addChild(s);
        }*/


        // full screen mode
        window.addEventListener('keydown', (event) => {
            if (event.key == '`') {
                if (this.pixi.canvas.requestFullscreen) {
                    this.pixi.canvas.requestFullscreen();
                } else if (this.pixi.canvas.webkitRequestFullscreen) { // Safari
                    this.pixi.canvas.webkitRequestFullscreen();
                } else if (this.pixi.canvas.msRequestFullscreen) { // IE11
                    this.pixi.canvas.msRequestFullscreen();
                }
            }
        });

        // system display text
        this.displayText = new PIXI.Text({
            text: 'Loading...',
            style: {
                fill: '#ffffff',
                fontSize: 16
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

            // overwrite player count from network object
            gameData["systems"]["input"]["players"] = this.network.config.playerCount;
            gameData["systems"]["input"]["seed"] = seed;

            for (let i = 0; i < this.network.config.playerCount; ++i) {
                this.roster.push({
                    //connected: false,
                    connected: true,
                    name: "slot " + i,
                    count: 0
                });
            }

            let testy = this.game.setup({
                local: this.network.local,
                data: gameData
            });

            console.log(testy);

            console.log("sending ready frame");
            this.network.ready(); 

            // get the update loop started!
            this.lastTick = 0;
            requestAnimationFrame((deltaTotal) => {
                this.lastTick = deltaTotal;
                this.update(deltaTotal);
            });

            //console.log(this.config);

            // if players is more than one, download roster
            if (this.network.config.playerCount > 1) {
                const response = await fetch(`${this.config.domain.url}roster`, {
                    headers: { 'Accept': 'application/json' },
                    method: 'GET'
                });
                const json = await response.json();
                if (json.hasOwnProperty('code')) {
                    console.log('failed to get roster');
                } else {
                    //console.log(json);
                    for (let i = 0; i < this.network.config.playerCount; ++i) {
                        if (json[i].connected == true) {
                            this.roster[i].connected = true;
                            if (json[i].user != null) {
                                this.roster[i].name = json[i].user.name;
                            }
                        }
                    }
                }
            } else {
                this.roster[0].name = "Host";
            }
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

            if (gamepad.buttons[0].value > 0) { 
                this.otherInput.leftShot = true;
                this.otherInput.used = true;
            }
            if (gamepad.buttons[1].value > 0) { 
                this.otherInput.rightShot = true;
                this.otherInput.used = true;
            }

            //consolelog(`${x} ${y} ${d}`);

            if (d > 0.005) {
                this.otherInput.left.x = -32767 + slope * (x - -1.0);
                this.otherInput.left.y = -32767 + slope * (y - -1.0);
                this.otherInput.used = true;
            }
        }
        if (this.mouseActive == true) {
            const dx = this.input.mouseX - window.innerWidth / 2;
            const dy = this.input.mouseY - window.innerHeight / 2;
            const dl = Math.sqrt(dx * dx + dy * dy);
            const dm = Math.min(window.innerHeight / 2 - 10, window.innerWidth / 2 - 10);
            if (dl < dm) {
                if (dl < 8.0) {
                    this.otherInput.left.x = 0;
                    this.otherInput.left.y = 0;
                    this.otherInput.used = true;
                } else {
                    const x = dx / dm;
                    const y = dy / dm;
                    //console.log(x + ", " + y + " - " + dl);
                    this.otherInput.left.x = -32767 + slope * (x - -1.0);
                    this.otherInput.left.y = -32767 + slope * (y - -1.0);
                    this.otherInput.used = true;
                }
            }
        }
        let kdx = 0;
        let kdy = 0;
        if (this.input.keyState['ArrowUp'])     { kdy = -1.0; }
        if (this.input.keyState['ArrowDown'])   { kdy =  1.0; }
        if (this.input.keyState['ArrowLeft'])   { kdx = -1.0; }
        if (this.input.keyState['ArrowRight'])  { kdx =  1.0; }
        if (kdx != 0 || kdy != 0) {
            const dist = Math.sqrt(kdx * kdx + kdy * kdy);
            const x = kdx / dist;
            const y = kdy / dist;
            this.otherInput.left.x = -32767 + slope * (x - -1.0);
            this.otherInput.left.y = -32767 + slope * (y - -1.0);
            this.otherInput.used = true;
        }

        if (this.input.mouseLeftButton) {
            if (this.mouseActive == true) {
                this.otherInput.leftShot = true;
                this.otherInput.used = true;
            } else {
                this.mouseActive = true;
            }
        }
        if (this.input.mouseRightButton) { 
            if (this.mouseActive == true) {
                this.otherInput.rightShot = true;
                this.otherInput.used = true;
            } else {
                this.mouseActive = true;
            }
        }

        if (this.input.keyState['z']) { 
            this.otherInput.leftShot = true;
            this.otherInput.used = true;
        }
        if (this.input.keyState['x']) { 
            this.otherInput.rightShot = true;
            this.otherInput.used = true;
        }

        // to pause the game
        // (if paused)
        // this.network.tickCounter = -this.network.frameTime;
        
        // true if input got sent over the network
        if (this.otherInput.used) {
            //console.log(this.otherInput);
            this.game.getInput(this.otherInput, this.network.inputBuffer);
        } else {
            this.game.getInput(this.input, this.network.inputBuffer);
        }

        if (this.network.update(delta)) {
            // reset keys maybe
            this.otherInput.leftShot = false;
            this.otherInput.rightShot = false;
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

        //this.game.dump(this.dump);
        //console.log(this.dump);

        //this.text(10,10,"I AM HERE!");

        this.game.dump(this.roster);

        //console.log(this.roster);

        let seconds = Math.floor(this.network.fastForwardFrame / 60);
        let minutes = Math.floor(seconds / 60);
        let hours = Math.floor(minutes / 60);

        seconds -= minutes * 60;
        minutes -= hours * 60;

        let sbuf = "";
        let mbuf = "";
        let tbuf = "";

        if (seconds < 10) { sbuf = "0"; }
        if (minutes < 10) { mbuf = "0"; }
        if (this.network.stalled) { tbuf = "X"; }

        this.displayText.visible = true;
        let total = 0;
        let str = `${hours}:${mbuf}${minutes}:${sbuf}${seconds} ${tbuf}\n`;
        for (let i = 0; i < this.roster.length; ++i) {
            if (this.roster[i].connected == true) {
                str += `${this.roster[i].name}: ${this.roster[i].count}`;
                total += this.roster[i].count;
                if (i == this.network.local) {
                    str += '    <- You\n';
                } else {
                    str += '\n';
                }
            }
        }
        str += `Total: ${total}\n`;
        this.displayText.text = str;

        this.screen.end();

        requestAnimationFrame(this.update.bind(this));
    }

    screenTransform(x, y, z, r) {
        this.screen.scroll(-x * z + this.screen.desiredWidth / 2, -y * z + this.screen.desiredHeight / 2);
        this.screen.rotate(r);
        this.screen.zoom(z);
    }

    text(sx, sy, text, c=0xffffff) {
        let x = sx;
        let y = sy;
        for (let i = 0; i < text.length; ++i) {
            if (text.charAt(i) == '\n') {
                x = sx;
                y += 8;
            } else {
                let sprite = this.screen.next();
                sprite.anchor.set(0.0);
                sprite.visible = true;
                sprite.texture = this.textures["ascii"][text.charCodeAt(i)];
                sprite.x = x;
                sprite.y = y;
                sprite.scale.set(1.0);
                sprite.rotation = 0.0;
                sprite.tint = c;
                sprite.alpha = 1.0;
                x += 8;
            }
        }
    }

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

    sprite(x, y, w, h, t, a, ang) {
        let sprite = this.screen.next();
        sprite.anchor.set(0.5);
        sprite.visible = true;
        sprite.texture = this.textures["space"][this.texnames[t]];
        sprite.x = x;
        sprite.y = y;
        sprite.width = w;
        sprite.height = h;
        sprite.rotation = ang;
        sprite.tint = 0xffffff;
        sprite.alpha = a;
    }


}