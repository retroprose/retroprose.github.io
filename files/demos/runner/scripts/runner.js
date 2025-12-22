class RunnerIO extends PIXI.Container {

    constructor(local) {
        super();

        this.pixel = undefined;
        PIXI.Assets.load('../shared/images/white-pixel.png').then((texture) => {
            this.pixel = texture;
        });

        this.backgroundTex = undefined;
        PIXI.Assets.load('./images/background.png').then((texture) => {
            this.backgroundTex = texture;
        });

        this.runner = undefined;
        PIXI.Assets.load('./images/runner-sprite.json').then((texture) => {
            this.runnerTest = texture.textures;
            this.runner = [];
            let i = 0
            for (var k in texture.textures) {
                this.runner[i] = texture.textures[k];
                ++i;
            }
        });
        
        this.circles = {};

        this.local = local;

        this.bindInput = new Module.BindInput();
        this.game = new Module.BindGame();
        this.game.setLocal(this.local);
        this.game.testLoadNode(window.load_default);

        this.input = new RunnerInput();
        this.screen = new Screen(960, 540);
        
        this.input.screen = this.screen;

        this.addChild(this.screen);
        this.addChild(this.input);
    }

    destroy() {
        super.destroy();
        this.game.delete();
        this.bindInput.delete();
    }

    resize() {
        this.input.resize();
        this.screen.resize();
    }

    network(playerInput) {
        this.game.setInput(playerInput);
    }

    processInput(buffer) {

        this.bindInput.up = false;
        this.bindInput.down = false;
        this.bindInput.left = false;
        this.bindInput.right = false;
        this.bindInput.a = false;
        this.bindInput.b = false;
        this.bindInput.x = false;
        this.bindInput.y = false;

        this.bindInput.x = 0;
        this.bindInput.y = 0;

        if (this.input.keyState['ArrowLeft'])    {this.bindInput.left = true;}
        if (this.input.keyState['ArrowRight'])   {this.bindInput.right = true;}
        if (this.input.keyState['ArrowUp'])    {this.bindInput.up = true;}
        if (this.input.keyState['ArrowDown'])   {this.bindInput.down = true;}

        if (this.input.keyState['x'])       {this.bindInput.x = true;}
        if (this.input.keyState['z'])       {this.bindInput.y = true;}
        //if (this.input.keyState[' '])       {this.bindInput.a = true;}

        if (this.input.keyState[' '])       {this.bindInput.up = true;}

        // touch jump
        if (this.input.touchDown)           {this.bindInput.up = true;}
                
        this.game.getInput(this.bindInput, buffer);
    }

    update() {
        return this.game.update();
    }

    render() {
        if (!this.pixel || !this.runner || !this.backgroundTex) { return; }

        this.screen.begin();

        //this.screen.scroll(20 * 16, 0);
        //this.screen.rotate(-cA);
        //this.screen.zoom(20);

        this.screen.scroll(-this.game.getCameraX() * this.game.getCameraScale() + 480, -this.game.getCameraY() * this.game.getCameraScale() + 270);
        this.screen.rotate(0);
        this.screen.zoom(this.game.getCameraScale());

        // do background image!
        let modcam = Math.floor(this.game.getCameraX() / 2);
        modcam = modcam % 512;     
        for (let i = 0; i < 3; ++i) {
            let s = this.screen.next();
            s.anchor.set(0.0);
            s.texture = this.backgroundTex;
            s.alpha = 1.0;
            s.tint = 0x00ffffff;
            s.x = (-480 + i * 512) + this.game.getCameraX() - modcam;
            s.y = (-270) + this.game.getCameraY();
            s.rotation = 0.0;
            s.scale.set(1.0);
        }

        //s.texture = this.runner['astro_0_0'];

        this.game.begin();
        while ( this.game.next() ) {
            let s = this.screen.next();
            if (this.game.image != 309) {
                s.anchor.set(0.5);
                s.texture = this.runner[this.game.image];
                s.alpha = this.game.alpha;
                s.tint = this.game.color;
                s.x = this.game.position_x;
                s.y = this.game.position_y;
                s.rotation = this.game.rotation;
                s.scale.set(1.0);
            } else {
         
                s.anchor.set(0.5);
                s.alpha = this.game.alpha;
                s.tint = this.game.color;
                s.x = this.game.position_x;
                s.y = this.game.position_y;
                s.rotation = this.game.rotation;
                if (this.game.image == 309) {
                    if (this.game.size_y == -1) {
                        // circle
                        let radius = Math.floor(this.game.size_x);
                        if (!(radius in this.circles)) {
                            let graphics = new PIXI.Graphics().circle(0, 0, radius).fill(0xffffff);
                            this.circles[radius] = window.__PIXI_APP__.renderer.generateTexture(graphics);
                            graphics.destroy();
                        }
                        s.texture = this.circles[radius];
                        s.width = this.game.size_x + this.game.size_x;
                        s.height = s.width;
                    } else {
                        // square
                        s.texture = this.pixel;
                        s.width = this.game.size_x + this.game.size_x;
                        s.height = this.game.size_y + this.game.size_y;
                    }
                } else {
                    s.texture = this.runner[6];
                    s.scale.set(1.0);
                }

            }
            
           

           
        }

        if (this.game.getLocalDead()) {
            for (let i = 0; i < this.game.getPlayerCount(); ++i) {
                let pre = "       Slot ";
                if (i == this.local) {
                    pre = "YOU -> Slot ";
                }
                this.screen.text(this.game.getCameraX(), i * 16, pre + i + ": " + this.game.getGems(i));
            }
        } else {
            this.screen.text(this.game.getCameraX(), 0, "Gems: " + this.game.getGems(this.local));
        }

        //this.screen.text(this.game.getCameraX() + 960 - 8, 0, "Gems: " + this.game.getLocalGems());



        this.screen.end();
    }



}