class SportIO extends PIXI.Container {

    constructor(local) {
        super();

        this.pixel = undefined;
        PIXI.Assets.load('../shared/images/white-pixel.png').then((texture) => {
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
    
        this.resetInput();
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

    resetInput() {
        // clear out all the booleans
        this.bindInput.up = false;
        this.bindInput.down = false;
        this.bindInput.left = false;
        this.bindInput.right = false;
        this.bindInput.bomb = false;
        this.bindInput.punch = false;
        this.bindInput.kick = false;
        this.bindInput.detonate = false;
    }

    processInput(buffer) {
        this.game.getInput(this.bindInput, buffer);
        this.resetInput();
    }

    updateDelta(delta) {
        // find the global target coordinate with respect to the whole play field
        this.targetX = ((this.input.xPos - this.screen.x) / this.screen.finalScale) + this.game.getCameraX();
        this.targetY = ((this.input.yPos - this.screen.y) / this.screen.finalScale) + this.game.getCameraY();
        
        // set the network input to that target coordinate
        this.bindInput.x = Math.floor(this.targetX);
        this.bindInput.y = Math.floor(this.targetY);

        // I'm using the bomb boolean for if the player has a finger down
        if (this.input.touchDown == true) this.bindInput.bomb = true;
    }

    update() {
        return this.game.update();    
    }

    render() {
        if (!this.pixel) { return; }

        this.screen.begin();

        // scroll screen to camera position
        this.screen.scroll(-this.game.getCameraX(), -this.game.getCameraY());

        this.game.begin();

        while ( this.game.next() ) {
            let s = this.screen.next();
            if (this.game.size_y == -1) {
                // circle
                let radius = Math.floor(this.game.size_x);
                if (!(radius in this.circles)) {
                    let graphics = new PIXI.Graphics().circle(0, 0, radius).fill(0xffffff);
                    this.circles[radius] = window.__PIXI_APP__.renderer.generateTexture(graphics);
                    graphics.destroy();
                }
                s.anchor.set(0.5);
                s.texture = this.circles[radius];
                s.alpha = 1.0;
                s.tint = this.game.color;
                s.x = this.game.position_x;
                s.y = this.game.position_y;
                s.width = this.game.size_x + this.game.size_x;
                s.height = this.game.size_x + this.game.size_x;
                s.rotation = this.game.rotation;
            } else {
                // square
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

        }

        // for debugging
        //this.screen.text(this.game.getCameraX(), this.game.getCameraY(), "" + this.xOffset + ", " + this.yOffset);
        //this.screen.text(this.game.getCameraX(), this.game.getCameraY(), "" + this.input.testX + ", " + this.input.testY);
        //this.screen.text(this.game.getCameraX(), this.game.getCameraY(), "" + this.targetX + ", " + this.targetY);

        //this.screen.text(this.game.getCameraX(), this.game.getCameraY(), "" + this.game.normal_x + ", " + this.game.normal_y + " - " + this.game.distance);

        this.screen.end();
    }


}