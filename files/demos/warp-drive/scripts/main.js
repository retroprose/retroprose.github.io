// main game class
class Main {

    async init(config) {
        // initialize pixi.js
        this.pixi = new PIXI.Application();
        await this.pixi.init({ background: '#000000', resizeTo: window });
        document.body.appendChild(this.pixi.canvas);
        PIXI.TextureStyle.defaultOptions.scaleMode = 'nearest';					

        this.game = new Module.BindGame();
        this.bindInput = new Module.BindInput();

        this.texture = undefined;
        PIXI.Assets.load('./images/sprite.json').then((texture) => {
            this.texture = texture;
        });
        this.renderObjectIndex = 0;

        this.config = config;

        // container for game objects
        //this.container = new PIXI.Container();
        //this.container.virtualWidth = 720;
        //this.container.virtualHeight = 405;
        //this.pixi.stage.addChild(this.container);

        // world and camera coordinates
        this.world = new PIXI.Container();
        this.camera = new PIXI.Container();
        this.screen = new PIXI.Container();

        this.screen.virtualWidth = 720;
        this.screen.virtualHeight = 405;
        this.camera.x = this.screen.virtualWidth / 2;
        this.camera.y = this.screen.virtualHeight / 2 + this.screen.virtualHeight / 4;

        this.camera.addChild(this.world);
        this.screen.addChild(this.camera);
        this.pixi.stage.addChild(this.screen);

        this.cameraData = {
            x: 0.0,
            y: 0.0,
            a: 0.0
        }

        this.visualizer = new NetworkVisualizer();
        this.visualizer.visible = false;
        this.pixi.stage.addChild(this.visualizer);

        // system display text
        this.displayText = new PIXI.Text({
            text: 'Loading...',
            style: {
                fill: '#ffffff',
                fontSize: 24
            },
            anchor: 0.5
        });
        this.pixi.stage.addChild(this.displayText);

        // event listeners
        this.resize();
        window.addEventListener("resize", () => this.resize());

        window.addEventListener('touchstart', (e) => e.preventDefault());
        window.addEventListener('touchend', (e) => e.preventDefault());

        this.pointerList = {};
        window.onpointerdown = (e) => {
            this.pointerList[e.pointerId] = {
                x: e.clientX,
                y: e.clientY
            };
        };
        window.onpointerup = (e) => {
            delete this.pointerList[e.pointerId];
        };
        window.onpointermove = (e) => {
            const id = e.pointerId;
            if (id in this.pointerList) {
                this.pointerList[id].x = e.clientX;
                this.pointerList[id].y = e.clientY;
            }
        };

        this.keyLeft = false;
        this.keyRight = false;
        this.keyPrimary = false
        window.addEventListener('keydown', (event) => {
            if (event.key == '`') {
                if (this.pixi.canvas.requestFullscreen) {
                    this.pixi.canvas.requestFullscreen();
                } else if (this.pixi.canvas.webkitRequestFullscreen) { // Safari
                    this.pixi.canvas.webkitRequestFullscreen();
                } else if (this.pixi.canvas.msRequestFullscreen) { // IE11
                    this.pixi.canvas.msRequestFullscreen();
                }
            } else if (event.key == 'ArrowLeft') {
                this.keyLeft = true;
            } else if (event.key == 'ArrowRight') {
                this.keyRight = true;
            } else if (event.key == ' ') {
                this.keyPrimary = true;
            } else if (event.key == 'p') {
                this.paused = !this.paused;
            } else if (event.key == '\\') {
                this.visualizer.visible = !this.visualizer.visible;
            }
        });
        window.addEventListener('keyup', (event) => {
            if (event.key == 'ArrowLeft') {
                this.keyLeft = false;
            } else if (event.key == 'ArrowRight') {
                this.keyRight = false;
            } else if (event.key == ' ') {
                this.keyPrimary = false;
            }
        });

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
                inputSize: 1
            });
        }

        this.network.ondisconnect = () => {
            this.displayText.visible = true;
            this.displayText.text = 'Disconnected';
        };
        this.network.onlaunch = async (seed) => {
        
            // hide display text
            this.displayText.visible = false;
            this.displayText.text = 'Stalled';

            // set up game here
            this.game.setup({
                seed: seed,
                playerCount: this.network.config.playerCount,
                local: this.network.local
            });

            console.log("sending ready frame");
            this.network.ready(); 

            // if players is more than one, download roster

            // get the update loop started!
            requestAnimationFrame((deltaTotal) => {
                this.lastTick = deltaTotal;
                this.update(deltaTotal);
            });

        };

        this.paused = false;
    
        return this;
    }

    resize() {
        // center text
        this.displayText.x = window.innerWidth / 2.0;
        this.displayText.y = window.innerHeight / 2.0;

        // scale invader screen
        const scaleX = window.innerWidth / this.screen.virtualWidth;
        const scaleY = window.innerHeight / this.screen.virtualHeight;
        const finalScale = Math.min(scaleX, scaleY);
        //const finalScale = 2.0;
        this.screen.scale.set(finalScale);
        
        this.screen.x = (window.innerWidth - (this.screen.virtualWidth * finalScale)) / 2;
        this.screen.y = (window.innerHeight - (this.screen.virtualHeight * finalScale)) / 2;
    }
    
    update(deltaTotal) {
        let delta = deltaTotal - this.lastTick;
        this.lastTick = deltaTotal;

        if (this.paused == false) {
            // update input with delta
            // if there are any touches on left or right side of screen
            for (let k in this.pointerList) {	
                if (this.pointerList[k].y < window.innerHeight / 2) {
                    this.bindInput.primary = true;
                } else {
                    if (this.pointerList[k].x < window.innerWidth / 2) {
                        this.bindInput.left = true;
                    } else if (this.pointerList[k].x >= window.innerWidth / 2) {
                        this.bindInput.right = true;
                    }
                }
            }
            if (this.keyLeft) { this.bindInput.left = true; }
            if (this.keyRight) { this.bindInput.right = true; }
            if (this.keyPrimary) { this.bindInput.primary = true; }

            // true if input got sent over the network
            this.game.getInput(this.bindInput, this.network.inputBuffer);
            if (this.network.update(delta)) {
                // reset the input
                this.bindInput.left = false;
                this.bindInput.right = false;
                this.bindInput.primary = false;
            }
            while (this.network.needsUpdate()) {
                this.game.setInput(this.network.frameBuffer);
                this.game.update();							
            }        
            if (this.network.needsCopy()) {							
                this.game.copy();
            }
            while (this.network.needsFastForward()) {
                this.game.setForwardInput(this.network.frameBuffer);
                this.game.forward();							
            }
        }

        // this code renders the screen by reusing sprites like a "sprite batch"
        if (this.texture) {
            this.renderObjectIndex = 0;
            this.game.render(this);
            for (let i = this.renderObjectIndex; i < this.world.children.length; ++i) {
                this.world.children[i].visible = false;
            }
        }

        this.world.x = this.cameraData.x;
        this.world.y = this.cameraData.y;
        //this.camera.angle = this.cameraData.a;
        this.camera.angle = this.lerpAngle(this.camera.angle, this.cameraData.a, (delta / 1000.0) * 2.5);

        this.displayText.visible = this.network.stalled;

        if (this.visualizer.visible) {
            this.visualizer.update(this.network);
        }

        // only request if we are still connected!
        if (this.network.connected) {
            requestAnimationFrame(this.update.bind(this));
        }
    }

    lerpAngle(p_from, p_to, p_weight) {
        let difference = (p_to - p_from) % 360;
        let distance = ((2.0 * difference) % 360) - difference;
        return p_from + distance * p_weight;    
    }

    setCamera(x, y, angle) {
        this.cameraData.x = -x;
        this.cameraData.y = -y;
        this.cameraData.a = -angle;
    }

    // x, y, frame, scale, color
    sprite(x, y, frame, color, angle=0.0, alpha=1.0, scale=1.0) {
        if (this.world.children.length <= this.renderObjectIndex) {
            this.world.addChild(new PIXI.Sprite());
        }
        let sprite = this.world.children[this.renderObjectIndex++];
        sprite.anchor.set(0.5);
        sprite.visible = true;
        sprite.texture = this.texture.textures[frame];
        sprite.x = x;
        sprite.y = y;
        sprite.angle = angle;
        sprite.tint = color;
        sprite.alpha = alpha;
        sprite.scale.set(scale);
    }

}