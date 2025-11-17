class BasicInput extends PIXI.Container {

    constructor() {
        super();

        this.keyState = {};

        // bind functions
        this.keyDown = this.keyDown.bind(this);
        this.keyUp = this.keyUp.bind(this);
        this.gamepadConnected = this.gamepadConnected.bind(this);
        this.gamepadDisconnected = this.gamepadDisconnected.bind(this);

        // add keypress listeners
        window.addEventListener('keyup', this.keyUp);
        window.addEventListener('keydown', this.keyDown);
        window.addEventListener('gamepadconnected', this.gamepadConnected);
        window.addEventListener('gamepaddisconnected', this.gamepadDisconnected);

    }

    destroy() {
        super.destroy();
        window.removeEventListener('keyup', this.keyUp);
        window.removeEventListener('keydown', this.keyDown);
        window.removeEventListener('gamepadconnected', this.gamepadConnected);
        window.removeEventListener('gamepaddisconnected', this.gamepadDisconnected);
    }

    keyDown(e) {
        this.keyState[e.key] = true;
        console.log("key: " + e.key);
    }

    keyUp(e) {
        this.keyState[e.key] = false;
    } 

    gamepadConnected(e) {
        console.log(
            "Gamepad connected at index %d: %s. %d buttons, %d axes.",
            e.gamepad.index,
            e.gamepad.id,
            e.gamepad.buttons.length,
            e.gamepad.axes.length,
        );
        this._gamepads[e.gamepad.index] = e.gamepad;
    }

    gamepadDisconnected(e) {
        console.log(
            "Gamepad disconnected from index %d: %s",
            e.gamepad.index,
            e.gamepad.id,
        );
        delete this._gamepads[e.gamepad.index];
    }

    resize() {

    }

    update(delta) {

    }
    
}