class GameInput extends BasicInput {

    constructor() {
        super();

        this.dpad = new PIXI.Graphics();
        this.addChild(this.dpad);

        this.left = new PIXI.Graphics();
        this.left.visible = false;
        this.addChild(this.left);

        this.right = new PIXI.Graphics();
        this.right.visible = false;
        this.addChild(this.right);

        this.buttons = new PIXI.Graphics();
        this.addChild(this.buttons);

        this.a = new PIXI.Graphics();
        this.a.visible = false;
        this.addChild(this.a);

        this.b = new PIXI.Graphics();
        this.b.visible = false;
        this.addChild(this.b);
       


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
    }

    resize() {

        const shift = 5.0;
        const stickLength = 100.0;
        const diag = 1.0 / Math.sqrt(2);

        // dpad
        this.dpad.dotProduct = diag * 0 + diag * window.innerHeight;
        this.dpad.x = 0;
        this.dpad.y = window.innerHeight;
        this.dpad.alpha = 0.5;
        this.dpad
            .clear()
            .moveTo(0, 0)
            .lineTo(diag * stickLength, -diag * stickLength)
            .stroke({ color: 0xffffff, width: 3 })
        ;

        this.left.x = 0;
        this.left.y = window.innerHeight;
        this.left.x -= diag * shift;
        this.left.y -= diag * shift;
        this.left
            .clear()
            .moveTo(0, 0)
            .lineTo(diag * stickLength, -diag * stickLength)
            .stroke({ color: 0xffffff, width: 5 })
        ;

        this.right.x = 0;
        this.right.y = window.innerHeight;
        this.right.x += diag * shift;
        this.right.y += diag * shift;
        this.right
            .clear()
            .moveTo(0, 0)
            .lineTo(diag * stickLength, -diag * stickLength)
            .stroke({ color: 0xffffff, width: 5 })
        ;

        // buttons
        this.buttons.dotProduct = -diag * window.innerWidth + diag * window.innerHeight;
        this.buttons.x = window.innerWidth;
        this.buttons.y = window.innerHeight;
        this.buttons.alpha = 0.5;
        this.buttons
            .clear()
            .moveTo(0, 0)
            .lineTo(-diag * stickLength, -diag * stickLength)
            .stroke({ color: 0xffffff, width: 3 })
        ;

        this.a.x =  window.innerWidth;
        this.a.y = window.innerHeight;
        this.a.x += -diag * shift;
        this.a.y += diag * shift;
        this.a
            .clear()
            .moveTo(0, 0)
            .lineTo(-diag * stickLength, -diag * stickLength)
            .stroke({ color: 0xffffff, width: 5 })
        ;

        this.b.x =  window.innerWidth;
        this.b.y = window.innerHeight;
        this.b.x -= -diag * shift;
        this.b.y -= diag * shift;
        this.b
            .clear()
            .moveTo(0, 0)
            .lineTo(-diag * stickLength, -diag * stickLength)
            .stroke({ color: 0xffffff, width: 5 })
        ;

        // dpad
        /*this.dpad.dotProduct = diag * 0 + diag * window.innerHeight;
        this.dpad.x = 0;
        this.dpad.y = window.innerHeight;
        this.dpad.clear().moveTo(0, 0).lineTo(diag * window.innerWidth, -diag * window.innerWidth).stroke({ color: 0xffffff, width: 1 });
    
        this.left.x = 0;
        this.left.y = window.innerHeight;
        this.left.clear().poly([
            0, 0,
            0, -window.innerHeight,
            diag * window.innerWidth, -diag * window.innerWidth
        ])
        .fill(0xffffff); // Red fill

        this.right.x = 0;
        this.right.y = window.innerHeight;
        this.right.clear().poly([
            0, 0,
            window.innerWidth / 2, 0,
            diag * window.innerWidth, -diag * window.innerWidth
        ])
        .fill(0xffffff); // Red fill

        // buttons
        this.buttons.dotProduct = -diag * window.innerWidth + diag * window.innerHeight;
        this.buttons.x = window.innerWidth;
        this.buttons.y = window.innerHeight;
        this.buttons.clear().moveTo(0, 0).lineTo(diag * -window.innerWidth, -diag * window.innerWidth).stroke({ color: 0xffffff, width: 1 });
    
        this.a.x = window.innerWidth;
        this.a.y = window.innerHeight;
        this.a.clear().poly([
            0, 0,
            -window.innerHeight, 0,
            -diag * window.innerWidth, -diag * window.innerWidth
        ])
        .fill(0xffffff); // Red fill

        this.b.x = window.innerWidth;
        this.b.y = window.innerHeight;
        this.b.clear().poly([
            0, 0,
            0, -window.innerHeight / 2,
            -diag * window.innerWidth, -diag * window.innerWidth
        ])
        .fill(0xffffff); // Red fill*/
    
    }

    update(delta) {

        const diag = 1.0 / Math.sqrt(2);
        const threshold = 10.0;

        this.left.visible = false;
        this.right.visible = false;
        this.a.visible = false;
        this.b.visible = false;

        if (this.keyState['ArrowLeft'])    { this.left.visible = true; }
        if (this.keyState['ArrowRight'])   { this.right.visible = true; }
        if (this.keyState['ArrowDown'])    { this.left.visible = true; this.right.visible = true; }
        if (this.keyState['z'])   { this.a.visible = true; }
        if (this.keyState['x'])   { this.b.visible = true; }

        for (let k in this.list) {
            const point = this.list[k];
            if (point.x <= window.innerWidth / 2) {
                const dotProduct = diag * point.x + diag * point.y;
                const diff = Math.abs(dotProduct - this.dpad.dotProduct);
                if (diff < threshold) {
                    this.left.visible = true;
                    this.right.visible = true;
                } else if (dotProduct < this.dpad.dotProduct) {
                    this.left.visible = true;
                } else if (dotProduct > this.dpad.dotProduct) {
                    this.right.visible = true;
                }
            }
            if (this.list[k].x > window.innerWidth / 2) {
                const dotProduct = -diag * point.x + diag * point.y;
                const diff = Math.abs(dotProduct - this.buttons.dotProduct);
                if (diff < threshold) {
                    this.a.visible = true;
                    this.b.visible = true;
                } else if (dotProduct < this.buttons.dotProduct) {
                    this.b.visible = true;
                } else if (dotProduct > this.buttons.dotProduct) {
                    this.a.visible = true;
                }    
            }
        }


     



    }
    
}