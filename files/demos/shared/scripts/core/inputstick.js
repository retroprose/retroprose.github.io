class InputStick extends BasicInput {

    constructor() {
        super();

        this.stickSize = 64;
        this.stickPadding = 16;

        this.circle = new PIXI.GraphicsContext().circle(0, 0, this.stickSize).fill(0xffffff);

        this.button = new PIXI.Graphics(this.circle);
        this.button.eventMode = 'static';
        this.button.tint = 0xff0000;

        this.buttonState = false;
        this.stickStateX = 0;
        this.stickStateY = 0;

        this.button.on('pointerover', (e) => {
            this.button.tint = 0xc80000;
            this.buttonState = true;
        });

        this.button.on('pointerout', (e) => {
            this.button.tint = 0xff0000;
            this.buttonState = false;
        });

        this.addChild(this.button);


        this.pad = new PIXI.Graphics(this.circle);
        this.pad.eventMode = 'static';
        this.pad.tint = 0xc8c8c8;

        this.pad.pressedIt = false;

        this.pad.on('pointerdown', (e) => {
            this.pad.pressedIt = true;
            this.stick.x = e.client.x;
            this.stick.y = e.client.y;
            // clip distance to pad
            let dx = this.stick.x - this.pad.x;
            let dy = this.stick.y - this.pad.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d > this.stickSize) {
                dx /= d;
                dy /= d;
                dx *= this.stickSize;
                dy *= this.stickSize;
                this.stick.x = this.pad.x + dx;
                this.stick.y = this.pad.y + dy;
            }
            // find 0 - 1 values
            this.stickStateX = (this.stick.x - this.pad.x) / this.stickSize;
            this.stickStateY = (this.stick.y - this.pad.y) / this.stickSize;
        });
        this.pad.on('pointerup', (e) => {
            this.pad.pressedIt = false;
            this.stick.x = this.pad.x;
            this.stick.y = this.pad.y;
            this.stickStateX = 0;
            this.stickStateY = 0;
        });
        this.pad.on('pointerupoutside', (e) => {
            this.pad.pressedIt = false;
            this.stick.x = this.pad.x;
            this.stick.y = this.pad.y;
            this.stickStateX = 0;
            this.stickStateY = 0;
        });

        this.pad.on('globalpointermove', (e) => {
            if (this.pad.pressedIt == true) {
                this.stick.x = e.client.x;
                this.stick.y = e.client.y;
                // clip distance to pad
                let dx = this.stick.x - this.pad.x;
                let dy = this.stick.y - this.pad.y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d > this.stickSize) {
                    dx /= d;
                    dy /= d;
                    dx *= this.stickSize;
                    dy *= this.stickSize;
                    this.stick.x = this.pad.x + dx;
                    this.stick.y = this.pad.y + dy;
                }
                // find 0 - 1 values
                this.stickStateX = (this.stick.x - this.pad.x) / this.stickSize;
                this.stickStateY = (this.stick.y - this.pad.y) / this.stickSize;
            }
        });

        this.addChild(this.pad);
        this.stick = new PIXI.Graphics(this.circle);
      
        this.stick.scale.set(0.25);
        this.stick.tint = 0xffffff;

        this.addChild(this.stick);

    }

    resize() {
        this.pad.x = this.button.width / 2 + this.stickPadding;
        this.pad.y = window.innerHeight - this.button.height / 2 - this.stickPadding;
        this.stick.x = this.pad.x;
        this.stick.y = this.pad.y;

        this.button.x = window.innerWidth - this.button.width / 2 - this.stickPadding;
        this.button.y = window.innerHeight - this.button.height / 2 - this.stickPadding;
    }

    update(delta) {
        
    }
    
}