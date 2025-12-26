class DebugIO extends PIXI.Container {

    constructor(local) {
        super();

        this.game = new Module.BindGame();

        this.input = new BasicInput();
        this.screen = new Screen(960, 540);

        this.addChild(this.screen);
        this.addChild(this.input);
    }

    destroy() {
        super.destroy();
        this.game.delete();
    }

    resize() {
        this.input.resize();
        this.screen.resize();
    }

    network(playerInput) {

    }

    processInput(buffer) {

        // might do things

    }

    updateDelta(delta) {
        
    }

    update() {
        return false;
    }


    render() {
        this.screen.begin();

        // scroll screen to camera position
        this.screen.scroll(0, 0);
        this.screen.rotate(0);
        this.screen.zoom(1);

        this.screen.text(0, 0, "I am debugging!");
        
        this.screen.end();
    }


}