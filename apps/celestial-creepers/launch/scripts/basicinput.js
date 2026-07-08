class BasicInput extends PIXI.Container {

    constructor() {
        super();

        this.screen = null;

        this.keyState = {};
        this.mouseButton = false;
        this.mouseX = 0;
        this.mouseY = 0;

        this._gamepads = {};

        // bind functions
        this.keyDown = this.keyDown.bind(this);
        this.keyUp = this.keyUp.bind(this);
        this.gamepadConnected = this.gamepadConnected.bind(this);
        this.gamepadDisconnected = this.gamepadDisconnected.bind(this);

        this.mouseDown = this.mouseDown.bind(this);
        this.mouseUp = this.mouseUp.bind(this);
        this.mouseMove = this.mouseMove.bind(this);

        // add keypress listeners
        window.addEventListener('keyup', this.keyUp);
        window.addEventListener('keydown', this.keyDown);
        window.addEventListener('gamepadconnected', this.gamepadConnected);
        window.addEventListener('gamepaddisconnected', this.gamepadDisconnected);

        window.addEventListener('mouseup', this.mouseUp);
        window.addEventListener('mousedown', this.mouseDown);
        window.addEventListener('mousemove', this.mouseMove);

    }

    destroy() {
        super.destroy();
        window.removeEventListener('keyup', this.keyUp);
        window.removeEventListener('keydown', this.keyDown);
        window.removeEventListener('gamepadconnected', this.gamepadConnected);
        window.removeEventListener('gamepaddisconnected', this.gamepadDisconnected);

        window.removeEventListener('mouseup', this.mouseUp);
        window.removeEventListener('mousedown', this.mouseDown);
        window.removeEventListener('mousemove', this.mouseMove);
    }

    resize() {
    
    }

    mouseUp(e) {
        this.mouseButton = false;
    }

    mouseDown(e) {
        this.mouseButton = true;
    }

    mouseMove(e) {
        /*if (this.screen != null) {
            //const local = this.screen.toLocal({x: e.screenX, y: e.screenY});
            const local = this.screen.toLocal({x: e.clientX, y: e.clientY});
            this.mouseX = local.x;
            this.mouseY = local.y;
        }*/
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
    }

    keyDown(e) {
        if (e.key == "\\") {
            this.visible = !this.visible;
        }
        this.keyState[e.key] = true;
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

    update(delta) {

    }
    
}