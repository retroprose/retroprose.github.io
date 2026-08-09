class GameInput extends BasicInput {

    constructor() {
        super();

        const lineColor = 0xc8c8c8;
        const lineWidth = 5;
        const analogRadius = 100;
        const slope = 1.0 * (32767 - -32767) / (1.0 - -1.0);

        this.list = {};

        let sprite;

        this.leftShot = false;
        this.rightShot = false;

        this.left = undefined;
        this.right = undefined;

        sprite = new PIXI.Graphics();
        sprite.circle(0, 0, analogRadius).stroke({ width: lineWidth, color: lineColor });
        sprite.visible = false;
        sprite.pointerId = undefined;
        this.addChild(sprite);
        this.leftSprite = sprite;

        sprite = new PIXI.Graphics();
        sprite.circle(0, 0, analogRadius).stroke({ width: lineWidth, color: lineColor });
        sprite.visible = false;
        sprite.pointerId = undefined;
        this.addChild(sprite);
        this.rightSprite = sprite;

        window.addEventListener('touchstart', (e) => e.preventDefault());
        window.addEventListener('touchend', (e) => e.preventDefault());
        window.addEventListener('contextmenu', (e) => e.preventDefault());

        window.onpointerdown = (e) => {
            if (e.pointerType == 'mouse') { return; }
            const id = e.pointerId;
            this.list[id] = {
                cx: e.clientX,
                cy: e.clientY,
                x: 0.0,
                y: 0.0
            };
            if (e.clientX < window.innerWidth / 2) {
                if (this.leftSprite.pointerId == undefined) {
                    this.leftSprite.pointerId = e.pointerId;
                    this.leftSprite.visible = true;
                    this.leftSprite.x = e.clientX;
                    this.leftSprite.y = e.clientY;
                    this.left = this.list[id];
                }
            } else {
                if (this.rightSprite.pointerId == undefined) {
                    this.rightSprite.pointerId = e.pointerId;
                    this.rightSprite.visible = true;
                    this.rightSprite.x = e.clientX;
                    this.rightSprite.y = e.clientY;
                    this.right = this.list[id];
                }
            }
        };
        window.onpointerup = (e) => {
            if (e.pointerType == 'mouse') { return; }
            const id = e.pointerId;
            delete this.list[id];
            if (this.leftSprite.pointerId == id) {
                this.leftSprite.pointerId = undefined;
                this.leftSprite.visible = false;
                this.left = undefined;
            }
            if (this.rightSprite.pointerId == id) {
                this.rightSprite.pointerId = undefined;
                this.rightSprite.visible = false;
                this.right = undefined;
            }
        };
        window.onpointermove = (e) => {
            if (e.pointerType == 'mouse') { return; }
            const id = e.pointerId;
            if (id in this.list) {
                let x = (e.clientX - this.list[id].cx) / analogRadius;
                let y = (e.clientY - this.list[id].cy) / analogRadius;
                let distance = Math.sqrt(x * x + y * y);
                if (distance > 1.0) {
                    x /= distance;
                    y /= distance;
                }
                this.list[id].x = -32767 + slope * (x - -1.0);
                this.list[id].y = -32767 + slope * (y - -1.0);
            }
        };
    }

    resize() {

    }

    update(delta) {
        this.leftShot = false;
        this.rightShot = false;
        if (this.right != undefined) {
            if (this.right.x < -0.2) {
                this.leftShot = true;
            }
            if (this.right.x > 0.2) {
                this.rightShot = true;
            }
            if (this.right.y > 0.2) {
                this.drop = true;
            }
        }
    }
    
}