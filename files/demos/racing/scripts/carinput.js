class CarInput extends BasicInput {

    constructor() {
        super();
        
        this.wheel = new PIXI.Graphics();
        this.knob = new PIXI.Graphics();
        this.gas = new PIXI.Graphics();
        this.gasCenter = new PIXI.Graphics();
        
        this.addChild(this.wheel);
        this.addChild(this.knob);
        this.addChild(this.gas);
        this.addChild(this.gasCenter);

        this.wheelRadians = 0;
        this.gasPetal = 0;

        this.radius = 0.0;

        this.touchDown = false;
        this.xPos = 0.0;
        this.yPos = 0.0;

        window.onpointerdown = (e) => {
            this.touchDown = true;
            this.xPos = e.clientX;
            this.yPos = e.clientY;
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

        this.radius = windowWidth * 0.5 / 2.0;

        this.wheel.clear().circle(0, 0, this.radius).stroke({ width: 5, color: 0xffffff });
        this.knob.clear().circle(0, 0, 10).fill(0xffffff);
        this.gas.clear().circle(0, 0, this.radius * 0.5).stroke({ width: 5, color: 0xff0000 });
        this.gasCenter.clear().circle(0, 0, this.radius * 0.5 - 10).fill(0xff0000);

        this.gas.x = windowWidth - this.gas.width / 2 - padding;
        this.gas.y = windowHeight - this.gas.height / 2 - padding;    
        
        this.gasCenter.x = this.gas.x;
        this.gasCenter.y = this.gas.y;

        this.wheel.x = this.wheel.width / 2 + padding;
        this.wheel.y = windowHeight - this.wheel.height / 2 - padding;
    }

    update(delta) {
    
        if (this.keyState['ArrowLeft'])     this.wheelRadians -= 2;
        if (this.keyState['ArrowRight'])    this.wheelRadians += 2;

        // vector to rotate
        this.knob.x = 0.0;
        this.knob.y = -this.radius;

        const radians = (Math.PI / 180.0) * this.wheelRadians;

        // rotate vector
        const cx = Math.cos(radians) * this.knob.x - Math.sin(radians) * this.knob.y;
        const cy = Math.sin(radians) * this.knob.x + Math.cos(radians) * this.knob.y;

        this.knob.x = cx;
        this.knob.y = cy;

        // translate to place
        this.knob.x += this.wheel.x;
        this.knob.y += this.wheel.y;

        this.gasPetal = 0.0;
        this.gasCenter.alpha = 0.0;
        if (this.keyState['ArrowUp']) {
            this.gasPetal = 1;
            this.gasCenter.alpha = 0.25;
        }
        if (this.keyState['ArrowDown']) {
            this.gasPetal = -1;
            this.gasCenter.alpha = 1.0;
        }

    }
    
}