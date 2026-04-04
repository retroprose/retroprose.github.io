
class Vector2 {

    constructor(_x, _y) {
        this.x = _x;
        this.y = _y;
    }

    eq(v)
        { return (this.x == v.x && this.y == v.y); }

    notEq(v) 
        { return (this.x != v.x || this.y != v.y); }

    multS(s) { new Vector2(this.x * s, this.y * s); }
    
    divS(s) { new Vector2(this.x / s, this.y / s); }

    // operations
    neg()
        { return new Vector2(-this.x, -this.y); }

    add(v)
        { return new Vector2(this.x+v.x, this.y+v.y); }

    sub(v)
        { return new Vector2(this.x-v.x, this.y-v.y); }

    addEq(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    subEq(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    multEq(s) {
        this.x *= s;
        this.y *= s;
        return this;
    }

    divEq(s) {
        let inv = 1.0 / s;
        this.x *= inv;
        this.y *= inv;
        return this;
    }

    // left and right hand perpendicular vectors	
    left()
        { return new Vector2(-this.y, this.x); }

    right()
        { return new Vector2(this.y, -this.x); }	
    
    // Dot products
    dot(v)
        { return this.x * v.x + this.y * v.y; }

    leftDot(v)
        { return this.y * v.x - this.x * v.y; }

    rightDot(v)
        { return this.x * v.y - this.y * v.x; }

    
    /*
        Normalize using distance formula, WARNING: easily overflow!
    */
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    lengthSq() {
        return this.x * this.x + this.y * this.y;
    }

    /*
        For a custom normalize
    */
    normalizeWithLen(length) {
        if (length > 0.0) {
            let invLength = 1.0 / length;
            this.x *= invLength;
            this.y *= invLength;
        } else {
            this.x = 0.0;
            this.y = 0.0;
        }
    }

    normalize() {
        let l = length();
        this.normalizeWithLen(l);
        return l;
    }

    /*
        GreatestSideLength
    */
    greatestSideLength() {
        return Math.max(Math.abs(this.x), Math.abs(this.y));
    }

    //Vector2 lerp(const Vector2& v, Scaler t) const {
        // return v1 * (1 - time) + v2 * time
    //    return Vector2(0, 0);
    //}

    // angle with respect to unit x axis
    angle() 
        { return Math.atan2(this.y, this.x); }

    // angle with respect to abritraty second vector
    angleVec(v)
        { return Math.atan2(this.y * v.x - this.x * v.y, this.x * v.x + this.y * v.y); }

    //Vector2 midPoint(const Vector2& v) const
    //    { return Vector2( (x+v.x) * Scaler::make(32768), (y+v.y) * Scaler::make(32768) ); }

    // rotate vector by angle
    rotate(a) {
        let c = Math.cos(a);
        let s = Math.sin(a);
        return Vector2(this.x * c - this.y * s, this.x * s + this.y * c);
    }

    reflect(n) {
        // -2 * (V dot N)*N + V
        return n.multS(-2.0 * this.dot(n)).add(this);
        //return new Vector2(-2.0 * this.dot(n) * n + this);
    }

    

}



class CollisionTest {

    async init() {
        // initialize pixi.js
        this.pixi = new PIXI.Application();
        await this.pixi.init({ background: '#000000', resizeTo: window });
        document.body.appendChild(this.pixi.canvas);

        this.container = new PIXI.Container();
        this.container.eventMode = 'static';
        this.pixi.stage.addChild(this.container);

        this.graphics = new PIXI.Graphics();
        this.container.addChild(this.graphics);

        this.cursor = { x: 0.0, y: 0.0 };
        this.lastGlobal = undefined;

        window.addEventListener("keydown", this.keyDown.bind(this)); 
        window.addEventListener("resize", this.resize.bind(this));

        this.click = this.click.bind(this);
        this.container.on('click', this.click);
        this.container.on('globalmousemove', (e) => this.lastGlobal = e.global);
  
        // get the update loop started!
        requestAnimationFrame(this.update.bind(this));

        this.Point = {
            x: 0,
            y: 0,
            vx: 0,
            vy: 0
        };

        this.Box = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            w: 100,
            h: 100,
            vx: 0,
            vy: 0
        };

        this.F = {
            x: 0,
            y: 0,
            w: 50,
            h: 50,
            vx: 0,
            vy: 0
        };

        this.A = {
            x: 0,
            y: 0,
            w: 100,
            h: 100,
            vx: 0,
            vy: 0
        };

        this.B = {
            x: 0,
            y: 0,
            w: 50,
            h: 50,
            vx: 0,
            vy: 0
        };

        const self = this;
        window.c = {
            bindmap: (m) => {
                self.bindings = m;
            },
            bind: (key, fn) => {
                self.bindings[key] = fn;
                console.log(`${key} bound to ${fn}`);
            },
            Apos: () => {
                self.A.x = self.cursor.x;
                self.A.y = self.cursor.y;
                self.Box.x = self.cursor.x;
                self.Box.y = self.cursor.y;
                self.recompute();
            },
            Avel: () => {
                self.A.vx = self.cursor.x - self.A.x;
                self.A.vy = self.cursor.y - self.A.y;
                self.Box.vx = self.cursor.x - self.Box.x;
                self.Box.vy = self.cursor.y - self.Box.y;
                self.recompute();
            },
            Bpos: () => {
                self.B.x = self.cursor.x;
                self.B.y = self.cursor.y;
                self.Point.x = self.cursor.x;
                self.Point.y = self.cursor.y;
                self.recompute();
            },
            Bvel: () => {
                self.B.vx = self.cursor.x - self.B.x;
                self.B.vy = self.cursor.y - self.B.y;
                self.Point.vx = self.cursor.x - self.Point.x;
                self.Point.vy = self.cursor.y - self.Point.y;
                self.recompute();
            },
            cursor: (x, y) => {
                self.cursor.x = Math.floor(x);
                self.cursor.y = Math.floor(y);
                console.log("c.cursor(" + self.cursor.x + ", " + self.cursor.y + ")");
            },
        };

        this.bindings = {
            'a': window.c.Apos,
            's': window.c.Avel,
            'z': window.c.Bpos,
            'x': window.c.Bvel
        }
    }
    
    resize() {

    }

    click(e) {
        if (e.target == this.container) {
            const local = this.container.toLocal(e.global);
            window.c.cursor(local.x, local.y);
        }
    }

    keyDown(e) {
        if (this.bindings[e.key]) {
            this.bindings[e.key]();
        }
    }


   

    recompute_sweep() {

        let box = this.Box;
        let point = this.Point;

        let pvec = new Vector2(point.x, point.y);
        let bvec = new Vector2(box.x, box.y);
        let size = new Vector2(box.w, box.h);
        let vel = new Vector2(point.vx, point.vy);
        
        let rel = pvec.sub(bvec);
        let mx = 1;
        let my = 1;
        
        if (rel.x < 0) {
            rel.x = -rel.x;
            mx = -1;
        }
        if (rel.y < 0) {
            rel.y = -rel.y;
            my = -1;
        }

        let n = new Vector2(0, 0);
        let distance = 0;

        let dist = size.sub(p);

        if (rel.x > size.x && rel.y > size.y) {
            console.log("disjoint on both axis");
            let tx = (size.x - rel.x) * (vel.y * my);
            let ty = dist.y * (vel.x * mx);
            if (tx > ty) {
                console.log("axis x: " + mx);
                let ty2 = (-size.y - rel.y) * (vel.x * mx);
                if (tx < ty2) {
                    console.log("hit!");
                    n.x = 1 * mx;
                    n.y = 0;
                    distance = rel.x - size.x;
                } else {
                    console.log("miss!");
                }
            } else {
                console.log("axis y: " + my);
                let tx2 = (-size.x - rel.x) * (vel.y * my);
                if (ty < tx2) {
                    console.log("hit!");
                    n.y = 1 * my;
                    n.x = 0;
                    distance = rel.y - size.y;
                } else {
                    console.log("miss!");
                }
            }
        } else if (rel.x > size.x) {
            console.log("In x axis reigon");

            if (vel.x * mx > 0) {
                // miss
            } else {

            }

            let tx = (size.x - rel.x) * (vel.y * my);
            if (vel.y * my < 0) {
                console.log("vel.y smaller zero");
                let ty = (-size.y - rel.y) * (vel.x * mx);
                if (tx > ty) {
                    console.log("miss!");
                } else {
                    console.log("hit on x axis");
                    n.x = 1 * mx;
                    n.y = 0;
                    distance = rel.x - size.x;                    
                }
            } else {
                console.log("vel.y bigger zero");
                let ty = (size.y - rel.y) * (vel.x * mx);
                if (tx > ty) {
                    console.log("miss!");
                } else {
                    console.log("hit on x axis");
                    n.x = 1 * mx;
                    n.y = 0;
                    distance = rel.x - size.x;                    
                }
            }
        } else if (rel.y > size.y) {
            console.log("In y axis reigon");
            let tx = dist.x * (vel.y * my);
            let ty = dist.y * (vel.x * mx);
            let tx2 = (-size.x - rel.x) * (vel.y * my);
            if (ty > tx || ty > tx2) {
                console.log("miss!");
            } else {
                console.log("hit on y axis");
                n.y = 1 * my;
                n.x = 0;
                distance = rel.y - size.y;
            }
        } else {
            console.log("hit cause in center! (find closest normal maybe?)")
            n.x = 0;
            n.y = 0;
            distance = -999999
        }

        let relNv = vel.dot(n);
        let imp = relNv + distance - 0;

        console.log("imp: " + imp);

        // do velocity clip here based on normal!

    }

    recompute_spec() {

        let a = this.A;
        let b = this.B;
        let f = this.F;

        let rx = b.x - a.x;
        let ry = b.y - a.y;
        let mx = 1;
        let my = 1;

        if (rx < 0) {
            rx = -rx;
            mx = -1;
        }
        if (ry < 0) {
            ry = -ry;
            my = -1;
        }

        let dx = rx - b.w - a.w;
        let dy = ry - b.h - a.h;

        let dist = 0;

        let nx = 0;
        let ny = 0;

        if (dy < dx) {
            dist = dx;
            nx = mx;
            ny = 0;
        } else {
            dist = dy;
            nx = 0;
            ny = my;
        }

        let relVel = b.vx * nx + b.vy * ny;
        let relVel2 = b.vx * -ny + b.vy * nx;

        let vx = b.vx;
        let vy = b.vy;
        let remove = relVel + dist;
 
        if (remove < 0) {
            let alsoRemove = remove * (relVel2 / relVel);
            vx -= remove * nx;
            vy -= remove * ny;
            vx -= alsoRemove * -ny;
            vy -= alsoRemove * nx;
        }

        f.x = b.x + vx;
        f.y = b.y + vy;


    }
    
    recompute() {
        //this.recompute_spec();
        this.recompute_sweep();
    }

    update(delta) {
        
        let a = this.A;
        let b = this.B;
        let f = this.F;

        let point = this.Point;
        let box = this.Box;

        /*this.graphics
        .clear()
        
        .rect(0, 0, window.innerWidth, window.innerHeight)
        .fill(0x000000)
        
        .rect(a.x - a.w, a.y - a.h, a.w + a.w, a.h + a.h)
        .fill(0x555555)

        .rect(a.x - a.w + a.vx, a.y - a.h + a.vy, a.w + a.w, a.h + a.h)
        .fill(0xffffff)

        .rect(b.x - b.w, b.y - b.h, b.w + b.w, b.h + b.h)
        .fill(0x550000)

        .rect(b.x - b.w + b.vx, b.y - b.h + b.vy, b.w + b.w, b.h + b.h)
        .fill(0xff0000)

        .rect(f.x - f.w, f.y - f.h, f.w + f.w, f.h + f.h)
        .fill(0x00ff00)
        
        ;*/

        this.graphics
        .clear()
        
        .rect(0, 0, window.innerWidth, window.innerHeight)
        .fill(0x000000)
        
        .rect(box.x - box.w, box.y - box.h, box.w + box.w, box.h + box.h)
        .fill(0x555555)

        .rect(box.x - box.w + box.vx, box.y - box.h + box.vy, box.w + box.w, box.h + box.h)
        .fill(0xffffff)

        .circle(point.x, point.y, 10)
        .fill(0x550000)

        .circle(point.x + point.vx, point.y + point.vy, 10)
        .fill(0xff0000)

        /*.lineStyle({
            width: 5,
            color: 0xffffff,
            alpha: 1.0
        })*/
        .moveTo(point.x, point.y)
        .lineTo(point.x + point.vx * 2, point.y + point.vy * 2)
        .stroke({ color: 0xc8c8c8 })
            
        ;

        requestAnimationFrame(this.update.bind(this));
    }


}