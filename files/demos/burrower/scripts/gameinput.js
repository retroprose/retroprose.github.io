class GameInput extends BasicInput {

    constructor() {
        super();

        this.lastId = undefined;

        const lineColor = 0xc8c8c8;
        const lineWidth = 5;
        const analogRadius = 100;
        const listLength = 4;

        this.list = [];
        for (let i = 0; i < listLength; ++i) {
            this.list.push({
                down: false,
                x: 0.0,
                y: 0.0,
                dx: 0.0,
                dy: 0.0
            });
        }

        let sprite;

        sprite = new PIXI.Graphics();
        sprite.circle(0, 0, analogRadius).stroke({ width: lineWidth, color: lineColor });
        sprite.visible = false;
        this.addChild(sprite);
        this.left = {
            id: -1,
            sprite: sprite
        };

        sprite = new PIXI.Graphics();
        sprite.circle(0, 0, analogRadius).stroke({ width: lineWidth, color: lineColor });
        sprite.visible = false;
        this.addChild(sprite);
        this.right = {
            id: -1,
            sprite: sprite
        };

        window.onpointerdown = (e) => {

            this.lastId = e.pointerId;

            const id = e.pointerId;
            if (id < listLength) {
                this.list[id].down = true;
                this.list[id].x = e.clientX;
                this.list[id].y = e.clientY;
                this.list[id].dx = 0.0;
                this.list[id].dy = 0.0;
                let s = undefined;
                if (e.clientX < window.innerWidth / 2) {
                    if (this.left.id == -1) {
                        this.left.id = e.pointerId;
                        s = this.left.sprite;
                    }
                } else {
                    if (this.right.id == -1) {
                        this.right.id = e.pointerId;
                        s = this.right.sprite;
                    }
                }
                if (s != undefined) {
                    s.visible = true;
                    s.x = e.clientX;
                    s.y = e.clientY;
                }
            }
        };
        window.onpointerup = (e) => {
            const id = e.pointerId;
            if (id < listLength) {
                this.list[id].down = false;
                if (this.left.id == id) {
                    this.left.id = -1;
                    this.left.sprite.visible = false;
                }
                if (this.right.id == id) {
                    this.right.id = -1;
                    this.right.sprite.visible = false;
                }
            }
        };
        window.onpointermove = (e) => {
            const id = e.pointerId;
            if (id < listLength) {
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