class GameInput extends BasicInput {

    constructor() {
        super();

        this.list = {};
        
        this.doublePress = false;
        this.doubleTap = false;

        this.left = {
            current: false,
            last: false,
            timer: 0
        };
        this.right = {
            current: false,
            last: false,
            timer: 0
        };
        
        this.buttons = [ this.left, this.right ];


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
    }

    resize() {

    }

    update(delta) {
     
        this.doublePress = false;
        this.doubleTap = false;
        
        // get new button states
        for (let k in this.buttons) {
            const button = this.buttons[k];
            button.last = button.current;
            button.current = false;
            if (button.timer > delta) {
                button.timer -= delta;
            } else {
                button.timer = 0.0;
            }
        }
        if (this.keyState['ArrowLeft'])    {this.buttons[0].current = true;}
        if (this.keyState['ArrowRight'])   {this.buttons[1].current = true;}
        for (let k in this.list) {
            if (this.list[k].x <= window.innerWidth / 2) {
                this.buttons[0].current = true;
            }
            if (this.list[k].x > window.innerWidth / 2) {
                this.buttons[1].current = true;
            }
        }

        // detect button press combinations for left button
        if (this.left.current == true && this.left.last == false) {
            // detect double press
            if (this.right.current == true && this.right.timer > 0.0) {
                this.doublePress = true;
            }
            if (this.left.timer > 0.0) {
                this.doubleTap = true;
            }
            this.left.timer = 300.0;
        }
        // detect button press combinations for right button
        if (this.right.current == true && this.right.last == false) {
            // detect double press
            if (this.left.current == true && this.left.timer > 0.0) {
                this.doublePress = true;
            }
            if (this.right.timer > 0.0) {
                this.doubleTap = true;
            }
            this.right.timer = 300.0;
        }
    }
    
}