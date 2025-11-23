class SportIO extends PIXI.Container {

    constructor(local) {
        super();

        this.pixel = undefined;
        PIXI.Assets.load('../images/white-pixel.png').then((texture) => {
            this.pixel = texture;
        });

        this.circles = {};

        this.game = new Module.BindGame();
        this.bindInput = new Module.BindInput();

        this.local = local;
        this.game.setLocal(this.local);

        this.screen = new Screen(540, 960);
        this.input = new SportInput();

        this.targetX = 0.0;
        this.targetY = 0.0;

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

        // clear out all the booleans
        this.bindInput.up = false;
        this.bindInput.down = false;
        this.bindInput.left = false;
        this.bindInput.right = false;
        this.bindInput.bomb = false;
        this.bindInput.punch = false;
        this.bindInput.kick = false;
        this.bindInput.detonate = false;

        // find the global target coordinate with respect to the whole play field
        this.targetX = ((this.input.xPos - this.screen.x) / this.screen.finalScale) + this.game.getCameraX();
        this.targetY = ((this.input.yPos - this.screen.y) / this.screen.finalScale) + this.game.getCameraY();
        
        // set the network input to that target coordinate
        this.bindInput.x = Math.floor(this.targetX);
        this.bindInput.y = Math.floor(this.targetY);

        if (this.input.keyState['ArrowUp']) this.bindInput.up = true;
        if (this.input.keyState['ArrowDown']) this.bindInput.down = true;
        if (this.input.keyState['ArrowLeft']) this.bindInput.left = true;
        if (this.input.keyState['ArrowRight']) this.bindInput.right = true;

        // I'm using the bomb boolean for if the player has a finger down
        if (this.input.touchDown == true) this.bindInput.bomb = true;
       
        this.game.getInput(this.bindInput, buffer);
    }

    update() {
        return this.game.update();    
    }

    render() {
        if (!this.pixel) { return; }

        this.screen.begin();

        // find rotated point
        let cX = this.game.getCameraX();
        let cY = this.game.getCameraY();
        let cA = this.game.getCameraAngle();
        let cSin = Math.sin(-cA);
        let cCos = Math.cos(-cA);

        let rX = cX * cCos - cY * cSin;
        let rY = cX * cSin + cY * cCos;

        // scroll screen to camera position
        //this.screen.scroll(-rX + 270, -rY + 480 + 240);
        //this.screen.rotate(-cA);

        this.screen.scroll(8.0 * 20, 72.0 / 2 * 20);
        this.screen.zoom(20);

        this.game.begin();

        while ( this.game.next() ) {
            let s = this.screen.next();
            s.texture = this.pixel;
            s.anchor.set(0.5);
            s.alpha = 1.0;
            s.tint = this.game.color;
            s.x = this.game.position_x;
            s.y = this.game.position_y;
            s.width = this.game.size_x + this.game.size_x;
            s.height = this.game.size_y + this.game.size_y;
            s.rotation = this.game.rotation;
        }

        this.screen.end();
    }


}