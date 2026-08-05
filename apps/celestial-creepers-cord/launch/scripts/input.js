class Input extends PIXI.Container {

    constructor(pixel, count, padsize, offset) {

        super();

        this.pixel = pixel;
        this.cellCount = count;
        this.padsize = padsize;
        this.offset = offset;
        this.cellHeight = -1;

        this.pause = false;

        // make left and right throttle
        this.left = this.makeThrottle();
        this.right = this.makeThrottle();

        this.leftThrottle = 0;
        this.rightThrottle = 0;

        // disable touches
        window.addEventListener('touchstart', (e) => e.preventDefault());
        window.addEventListener('touchend', (e) => e.preventDefault());
        window.addEventListener('keyup', this.keyUp.bind(this));
        window.addEventListener('keydown', this.keyDown.bind(this));
        window.addEventListener('gamepadconnected', this.gamepadConnected.bind(this));
        window.addEventListener('gamepaddisconnected', this.gamepadDisconnected.bind(this));

        // hold key state
        this.keyState = {};
        this._gamepads = {};
        
        // touch listeners
        this.list = {};
        window.onpointerdown = (e) => {
            this.list[e.pointerId] = {
                x: e.clientX,
                y: e.clientY
            };
        };
        window.onpointerup = (e) => {
            delete this.list[e.pointerId];
        };
        window.onpointermove = (e) => {
            const id = e.pointerId;
            if (id in this.list) {
                this.list[id].x = e.clientX;
                this.list[id].y = e.clientY;
            }
        };

        this.resize();
    }

     destroy() {
        super.destroy();
        window.removeEventListener('keyup', this.keyUp.bind(this));
        window.removeEventListener('keydown', this.keyDown.bind(this));
        window.removeEventListener('gamepadconnected', this.gamepadConnected.bind(this));
        window.removeEventListener('gamepaddisconnected', this.gamepadDisconnected.bind(this));
    }

    keyDown(e) {
        if (e.key == "\\") {
            this.visible = !this.visible;
        }
        if (e.key == " ") {
            this.pause = !this.pause;
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


    makeThrottle() {
        let c = new PIXI.Container();
        for (let i = 0; i < this.cellCount; ++i) {
            let s = new PIXI.Sprite();
            s.texture = this.pixel;
            s.tint = 0xffffff;
            s.alpha = 0.25;
            s.width = this.padsize;
            s.throttle = this.cellCount - 2 - i;
            c.addChild(s);
        }
        this.addChild(c);
        return c;
    }

    resizeThrottle(c) {
        let y = 0;
        for (const item of c.children) {
            item.height = this.cellHeight;
            item.y = y;
            y += this.cellHeight;
        }
    }

    resize() {
        this.cellHeight = window.innerHeight / this.cellCount; 
        this.resizeThrottle(this.left);
        this.resizeThrottle(this.right);
        this.left.x = this.offset;
        this.right.x = window.innerWidth - this.offset - this.padsize;
    }

    update(delta) {
        
        // reset inputs
        for (const item of this.left.children) {
            item.alpha = 0.25;
        }
        for (const item of this.right.children) {
            item.alpha = 0.25;
        }
        this.leftThrottle = 0;
        this.rightThrottle = 0;
        
        // poll touch actions
        let s;
        for (let key in this.list) {
            const point = this.list[key];
            const index = Math.floor(point.y / this.cellHeight);
            if (index >= 0 && index < this.cellCount) {
                s = null;
                if (point.x < window.innerWidth / 2) {
                    s = this.left.getChildAt(index);
                    this.leftThrottle = s.throttle;
                } else {
                    s = this.right.getChildAt(index);
                    this.rightThrottle = s.throttle;
                }
                s.alpha = 0.5;
            }
        }

        // poll gamepad actions
        for (const gamepad of navigator.getGamepads()) {
            if (!gamepad) continue;
            //if (gamepad.buttons.length < 16) continue;

            let str = '';
            for (const index in gamepad.buttons) {
                if (gamepad.buttons[index].pressed) {
                    str += ` ${index}`;
                }
            }
            if (str != '') {
                console.log(str);
            }
        }

        // poll keys
        if (this.keyState['e']) { this.leftThrottle =  2; } 
        if (this.keyState['d']) { this.leftThrottle =  1; } 
        if (this.keyState['c']) { this.leftThrottle = -1; } 
        
        if (this.keyState['o']) { this.rightThrottle =  2; } 
        if (this.keyState['k']) { this.rightThrottle =  1; } 
        if (this.keyState['m']) { this.rightThrottle = -1; } 

    }

}