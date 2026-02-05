class GameInput extends BasicInput {

    constructor() {
        super();

        const lineColor = 0xc8c8c8;
        const lineWidth = 5;
        const analogRadius = 100;

        this.list = {};

        let sprite;

        sprite = new PIXI.Graphics();
        sprite.circle(0, 0, analogRadius).stroke({ width: lineWidth, color: lineColor });
        sprite.visible = false;
        sprite.pointerId = undefined;
        this.addChild(sprite);
        this.left = sprite;

        sprite = new PIXI.Graphics();
        sprite.circle(0, 0, analogRadius).stroke({ width: lineWidth, color: lineColor });
        sprite.visible = false;
        sprite.pointerId = undefined;
        this.addChild(sprite);
        this.right = sprite;

        window.onpointerdown = (e) => {
            if (e.pointerType == 'mouse') { return; }
            const id = e.pointerId;
            this.list[id] = {
                x: e.clientX,
                y: e.clientY,
                dx: 0.0,
                dy: 0.0
            };
            if (e.clientX < window.innerWidth / 2) {
                if (this.left.pointerId == undefined) {
                    this.left.pointerId = e.pointerId;
                    this.left.visible = true;
                    this.left.x = e.clientX;
                    this.left.y = e.clientY;
                }
            } else {
                if (this.right.pointerId == undefined) {
                    this.right.pointerId = e.pointerId;
                    this.right.visible = true;
                    this.right.x = e.clientX;
                    this.right.y = e.clientY;
                }
            }
        };
        window.onpointerup = (e) => {
            if (e.pointerType == 'mouse') { return; }
            const id = e.pointerId;
            delete this.list[id];
            if (this.left.pointerId == id) {
                this.left.pointerId = undefined;
                this.left.visible = false;
            }
            if (this.right.pointerId == id) {
                this.right.pointerId = undefined;
                this.right.visible = false;
            }
        };
        window.onpointermove = (e) => {
            if (e.pointerType == 'mouse') { return; }
            const id = e.pointerId;
            if (id in this.list) {
                this.list[id].dx = (e.clientX - this.list[id].x) / analogRadius;
                this.list[id].dy = (e.clientY - this.list[id].y) / analogRadius;
                let distance = Math.sqrt(this.list[id].dx * this.list[id].dx + this.list[id].dy * this.list[id].dy);
                if (distance > 1.0) {
                    this.list[id].dx /= distance;
                    this.list[id].dy /= distance;
                }
            }
        };
    }

    resize() {

    }

    update(delta) {
        

    }
    
}