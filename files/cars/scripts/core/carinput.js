class CarInput extends BasicInput {

    constructor() {
        super();
        
        this.wheel = new PIXI.Graphics();
        this.knob = new PIXI.Graphics();
        this.gas = new PIXI.Graphics();
        
        this.addChild(this.wheel);
        this.addChild(this.knob);
        this.addChild(this.gas);

        this.touchDown = false;
        this.xPos = 0.0;
        this.yPos = 0.0;

        window.onpointerdown = (e) => {
            this.touchDown = true;
            this.xPos = e.clientX;
            this.yPos = e.clientY;

            console.log(e);

        };
        window.onpointerup = (e) => {
            this.touchDown = false;
        };
        window.onpointermove = (e) => {
            this.xPos = e.clientX;
            this.yPos = e.clientY;
        };
    }

    resize() {
        const padding = 4;
        const windowWidth = this.parent.desiredWidth;
        const windowHeight = this.parent.desiredHeight;
        const radius = windowWidth * 0.5 / 2.0;

        this.wheel.clear().circle(0, 0, radius).stroke({ width: 5, color: 0xc8c8c8 });
        this.knob.clear().circle(0, 0, 10).fill(0xc8c8c8);
        this.gas.clear().circle(0, 0, radius * 0.5).stroke({ width: 5, color: 0xff0000 });

        this.gas.x = windowWidth - this.gas.width / 2 - padding;
        this.gas.y = windowHeight - this.gas.height / 2 - padding;        

        this.wheel.x = this.wheel.width / 2 + padding;
        this.wheel.y = windowHeight - this.wheel.height / 2 - padding;

        this.knob.x = this.wheel.x;
        this.knob.y = this.wheel.y + radius;
    }

    update(delta) {
    
    }
    
}