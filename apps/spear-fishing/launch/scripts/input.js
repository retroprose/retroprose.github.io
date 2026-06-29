class Input extends PIXI.Container {

    constructor(pixel, padsize, thickness, offset) {

        super();

        this.pixel = pixel;
        this.padsize = padsize;
        this.thickness = thickness;
        this.offset = offset;

        this.pad = new PIXI.Sprite();
        this.addChild(this.pad);

        this.bits = 0x0;
        
        this.noBits = 0x0;

        this.rightBit = 0x1;
        this.downBit = 0x1 << 1;
        this.leftBit = 0x1 << 2;
        this.upBit = 0x1 << 3;

        this.rightDownBits = this.rightBit | this.downBit;
        this.rightUpBits = this.rightBit | this.upBit;
        this.leftDownBits = this.leftBit | this.downBit;
        this.leftUpBits = this.leftBit | this.upBit;

        this.up = false;
        this.down = false;
        this.left = false;
        this.right = false;

        // pad squares
        let s;
        this.squares = [];

        const p = this.padsize;
        const t = this.thickness;
        const locations = [
            [t, -t, p, t+t],    // right
            [t, t, p, p],    // right-down
            [-t, t, t+t, p],    // down
            [-t-p, t, p, p],    // down-left
            [-t-p, -t, p, t+t],    // left
            [-t-p, -t-p, p, p],    // left-up
            [-t, -t-p, t+t, p],    // up
            [t, -t-p, p, p]     // right-up
        ]
        for (const a of locations) {
            s = new PIXI.Sprite();
            s.texture = this.pixel;
            s.x = a[0];
            s.y = a[1];
            s.width = a[2];
            s.height = a[3];
            if (this.squares.length % 2 == 0) {
                s.tint = 0xff0000;
            }  else {
                s.tint = 0xffffff;
            }
            this.squares.push(s);
            this.pad.addChild(s);
        }

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

        for (const t of this.squares) {
            t.alpha = 0.25;
        }

        this.bits = this.noBits;

        let padthumb = false;

        for (let key in this.list) {
               
            const point = this.list[key];

            const diffx = point.x - this.pad.x;
            const diffy = point.y - this.pad.y;

            const absx = Math.abs(diffx);
            const absy = Math.abs(diffy);

            if (absx < this.padsize && absy < this.padsize && padthumb == false) {
                padthumb = true;
                if (absx > this.thickness) {
                    if (diffx < 0) { this.bits |= this.leftBit; }
                    if (diffx > 0) { this.bits |= this.rightBit; }
                }
                if (absy > this.thickness) {
                    if (diffy < 0) { this.bits |= this.upBit; }
                    if (diffy > 0) { this.bits |= this.downBit; }
                }
            }

        }

        let i = -1;
        switch (this.bits) {
            case this.rightBit:         i =  0; break;
            case this.rightDownBits:    i =  1; break;
            case this.downBit:          i =  2; break;
            case this.leftDownBits:     i =  3; break;
            case this.leftBit:          i =  4; break;
            case this.leftUpBits:       i =  5; break;
            case this.upBit:            i =  6; break;
            case this.rightUpBits:      i =  7; break;
            default:                    i = -1; break;
        }

        if (i != -1) {
            this.squares[i].alpha = 0.5;
        }


    }


}