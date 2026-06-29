class Input extends PIXI.Container {

    constructor(pixel, padsize, thickness, offset) {

        super();

        this.pixel = pixel;
        this.padsize = padsize;
        this.thickness = thickness;
        this.offset = offset;

        this.pad = new PIXI.Sprite();
        this.addChild(this.pad);

        this.up = false;
        this.down = false;
        this.left = false;
        this.right = false;

        // pad squares
        let s;

        s = new PIXI.Sprite();
        s.texture = this.pixel;
        s.width = this.padsize;
        s.height = this.thickness;
        s.x = this.thickness / 2;
        s.y = -s.height / 2;
        s.tint = 0xffffff;
        s.alpha = 0.5;
        this.pad.right = s;
        this.pad.addChild(s);

        s = new PIXI.Sprite();
        s.texture = this.pixel;
        s.width = this.padsize;
        s.height = this.thickness;
        s.x = -this.thickness / 2 - s.width;
        s.y = -s.height / 2;
        s.tint = 0xffffff;
        s.alpha = 0.5;
        this.pad.left = s;
        this.pad.addChild(s);

        s = new PIXI.Sprite();
        s.texture = this.pixel;
        s.width = this.thickness;
        s.height = this.padsize;
        s.x = -s.width / 2;
        s.y = this.thickness / 2;
        s.tint = 0xffffff;
        s.alpha = 0.5;
        this.pad.down = s;
        this.pad.addChild(s);
        
        s = new PIXI.Sprite();
        s.texture = this.pixel;
        s.width = this.thickness;
        s.height = this.padsize;
        s.x = -s.width / 2;
        s.y = -this.thickness / 2 - s.height;
        s.tint = 0xffffff;
        s.alpha = 0.5;
        this.pad.up = s;
        this.pad.addChild(s);

    
        


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
        const size = this.padsize * 2 + this.thickness;
        
        this.pad.x = size / 2 + this.offset;
        this.pad.y = window.innerHeight - size / 2 - this.offset;
        
        //this.pad.x = window.innerWidth / 2;
        //this.pad.y = window.innerHeight / 2;



    }

    update(delta) {


        this.pad.left.alpha = 0.5
        this.pad.right.alpha = 0.5
        this.pad.up.alpha = 0.5
        this.pad.down.alpha = 0.5

        
        for (let key in this.list) {
               
            const point = this.list[key];

            const diffx = point.x - this.pad.x;
            const diffy = point.y - this.pad.y;

            const absx = Math.abs(diffx);
            const absy = Math.abs(diffy);

            

            if (absx > this.thickness) {
                if (diffx < 0) { this.left = true; this.pad.left.alpha = 1.0; }
                if (diffx > 0) { this.right = true; this.pad.right.alpha = 1.0; }
            }
            if (absy > this.thickness) {
                if (diffy < 0) { this.up = true; this.pad.up.alpha = 1.0; }
                if (diffy > 0) { this.down = true; this.pad.down.alpha = 1.0; }
            }



            /*if (point.x <= window.innerWidth / 2) {
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
            }*/

        }


    }


}