class RunnerIO extends PIXI.Container {

    constructor(local) {
        super();

        this.pixel = undefined;
        PIXI.Assets.load('../shared/images/white-pixel.png').then((texture) => {
            this.pixel = texture;
        });

        this.runner = undefined;
        PIXI.Assets.load('./images/runner-sprite.json').then((texture) => {
            this.runner = texture.textures;
        });
        
        this.circles = {};

        this.local = local;

        this.bindInput = new Module.BindInput();
        this.game = new Module.BindGame();
        this.game.testLoadNode(window.load_default);

        this.input = new BasicInput();
        this.screen = new Screen(800, 600);
        
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

        if (this.input.keyState[' '])       {this.bindInput.x = true;}

        //console.log(this.input.mouseX + ", " + this.input.mouseY + " - " + this.input.mouseButton);

        this.bindInput.axisX = this.input.mouseX;
        this.bindInput.axisY = this.input.mouseY;
        if (this.input.mouseButton) {this.bindInput.y = true;}
        
        if (window.loadjson !== undefined) {
            // Example usage:
            fetch('../data/' + window.loadjson + '.json', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            })
            .then(response => response.json())
            .then(response => this.game.testLoadNode(response));

            window.loadjson = undefined;
        }
        
        if (window.savejson !== undefined) {
            let saveObject = this.game.testSaveNode();
            console.log(saveObject);
            
            window.savejson = undefined;
        }
        
        this.game.getInput(this.bindInput, buffer);
    }

    update() {
        return this.game.update();
    }

    render() {
        if (!this.pixel || !this.runner) { return; }

        this.screen.begin();

        //this.screen.scroll(20 * 16, 0);
        //this.screen.rotate(-cA);
        //this.screen.zoom(20);

        this.screen.scroll(0, 0);
        this.screen.rotate(0);
        this.screen.zoom(1);

        //s.texture = this.runner['astro_0_0'];

        this.game.begin();
        while ( this.game.next() ) {
            let s = this.screen.next();
            s.anchor.set(0.5);
            s.alpha = 1.0;
            s.tint = this.game.color;
            s.x = this.game.position_x;
            s.y = this.game.position_y;
            s.width = this.game.size_x + this.game.size_x;
            s.rotation = this.game.rotation;
            if (this.game.size_y == -1) {
                // circle
                let radius = Math.floor(this.game.size_x);
                if (!(radius in this.circles)) {
                    let graphics = new PIXI.Graphics().circle(0, 0, radius).fill(0xffffff);
                    this.circles[radius] = window.__PIXI_APP__.renderer.generateTexture(graphics);
                    graphics.destroy();
                }
                s.texture = this.circles[radius];
                s.height = s.width;
            } else {
                // square
                s.texture = this.pixel;
                s.height = this.game.size_y + this.game.size_y;
            }
        }

        this.screen.end();
    }



}