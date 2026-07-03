class Input extends PIXI.Container {

    constructor(pixel, count, padsize, offset) {

        super();

        this.pixel = pixel;
        this.cellCount = count;
        this.padsize = padsize;
        this.offset = offset;
        this.cellHeight = -1;

        // make left and right throttle
        this.left = this.makeThrottle();
        this.right = this.makeThrottle();

        this.leftThrottle = 0;
        this.rightThrottle = 0;

        // disable touches
        window.addEventListener('touchstart', (e) => e.preventDefault());
        window.addEventListener('touchend', (e) => e.preventDefault());

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
        for (const item of this.left.children) {
            item.alpha = 0.25;
        }
        for (const item of this.right.children) {
            item.alpha = 0.25;
        }
        this.leftThrottle = 0;
        this.rightThrottle = 0;
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

    }

}