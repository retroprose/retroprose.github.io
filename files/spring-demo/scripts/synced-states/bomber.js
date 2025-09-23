class BomberIO extends PIXI.Container {

    constructor(local) {
        super();

        this.pixel = undefined;
        PIXI.Assets.load('../images/white-pixel.png').then((texture) => {
            this.pixel = texture;
        });

        this.ship = undefined;
        PIXI.Assets.load('../images/ship.png').then((texture) => {
            this.ship = texture;
        });

        this.local = local;

        this.game = new Module.BindGame();
        this.game.testLoadNode(window.load_default);

        this.bindInput = new Module.BindInput();
        this.bindRender = new Module.BindRenderObject();

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
        this.bindRender.delete();
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
        this.bindInput.bomb = false;
        this.bindInput.punch = false;
        this.bindInput.kick = false;
        this.bindInput.detonate = false;

        this.bindInput.x = 0;
        this.bindInput.y = 0;

        if (this.input.keyState['ArrowLeft'])    {this.bindInput.left = true;}
        if (this.input.keyState['ArrowRight'])   {this.bindInput.right = true;}
        if (this.input.keyState['ArrowUp'])    {this.bindInput.up = true;}
        if (this.input.keyState['ArrowDown'])   {this.bindInput.down = true;}

        //console.log(this.input.mouseX + ", " + this.input.mouseY + " - " + this.input.mouseButton);

        this.bindInput.x = this.input.mouseX;
        this.bindInput.y = this.input.mouseY;
        if (this.input.mouseButton) {this.bindInput.bomb = true;}

        if (window.loadjson !== undefined) {
            // Example usage:
            fetch('../data/' + window.loadjson + '.json', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            })
            .then(response => response.json())
            .then(response => this.game.testLoadNode(JSON.stringify(response)));

            window.loadjson = undefined;
        }
        
        if (window.savejson !== undefined) {
            let saveString = this.game.testSaveNode();
            console.log(saveString);
            
            window.savejson = undefined;
        }
        
        this.game.getInput(this.bindInput, buffer);
    }

    update() {
        return this.game.update();
    }

    render() {
        if (!this.pixel) { return; }

        this.screen.begin();

        let entity = this.bindRender;

        entity.begin(this.game);
        while ( entity.next() ) {
            let s = this.screen.next();
            s.anchor.set(0.5);
            s.texture = this.pixel;
            s.tint = entity.color;
            s.x = entity.position_x;
            s.y = entity.position_y;
            s.width = entity.size_x;
            s.height = entity.size_y;
            s.rotation = entity.rotation;
        }
        
        this.screen.end();
    }



}