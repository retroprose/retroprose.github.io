class Input extends PIXI.Container {

    constructor(pixel, padsize, thickness, offset, buttonsize) {

        super();

        this.pixel = pixel;
        this.padsize = padsize;
        this.thickness = thickness;
        this.offset = offset;
        this.buttonsize = buttonsize;

        this.pad = new PIXI.Sprite();
        this.addChild(this.pad);

        this.buttons = new PIXI.Sprite();
        this.addChild(this.buttons);

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

        this.start = false;
        this.select = false;
        this.a = false;
        this.b = false;

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
            [t, -t-p, p, p],     // right-up
            [this.thickness, -this.buttonsize/2, this.buttonsize, this.buttonsize],     // a
            [-this.thickness, -this.buttonsize/2, this.thickness+this.thickness, this.buttonsize],     // a+b
            [-this.thickness-this.buttonsize, -this.buttonsize/2, this.buttonsize, this.buttonsize]     // b
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
            if (this.squares.length > 8) {
                this.buttons.addChild(s);
            } else {
                this.pad.addChild(s);
            }
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
        
        //this.buttons.x = window.innerWidth / 2;
        //this.buttons.y = window.innerHeight / 2;

        this.buttons.x = window.innerWidth - this.thickness - this.buttonsize - this.offset;
        this.buttons.y = this.pad.y;


    }

    update(delta) {

        for (const t of this.squares) {
            t.alpha = 0.25;
        }

        this.bits = this.noBits;
        this.right = false;
        this.left = false;
        this.up = false;
        this.down = false;
        this.a = false;
        this.b = false;

        let padthumb = false;
        let diffx, diffy, absx, absy;

        for (let key in this.list) {
               
            const point = this.list[key];

            diffx = point.x - this.pad.x;
            diffy = point.y - this.pad.y;

            absx = Math.abs(diffx);
            absy = Math.abs(diffy);

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

            diffx = point.x - this.buttons.x;
            diffy = point.y - this.buttons.y;

            absx = Math.abs(diffx);
            absy = Math.abs(diffy);

            if (absx < this.buttonsize && absy < this.buttonsize / 2) {
                if (absx < this.thickness) {
                    this.a = true;
                    this.b = true;
                    this.squares[9].alpha = 0.5;
                } else {
                    if (diffx < 0) { this.b = true; this.squares[10].alpha = 0.5; }
                    if (diffx > 0) { this.a = true; this.squares[8].alpha = 0.5; }
                }
            }

        }

        if (this.bits & this.rightBit) { this.right = true; }
        if (this.bits & this.leftBit) { this.left = true; }
        if (this.bits & this.upBit) { this.up = true; }
        if (this.bits & this.downBit) { this.down = true; }

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