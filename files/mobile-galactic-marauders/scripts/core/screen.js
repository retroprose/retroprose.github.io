class Screen extends PIXI.Container {

    constructor(width, height) {
        super();

        this.ascii = undefined;
        PIXI.Assets.load('../images/tilemap-sprite.json').then((texture) => {
            this.ascii = [];
            for (const key in texture.textures) {
                this.ascii[parseInt(key)] = texture.textures[key];
            }
        });

        this.desiredWidth = width;
        this.desiredHeight = height;

        this.maskShape = new PIXI.Graphics();
        this.maskShape.beginFill(0xffffff); // The fill color doesn't matter for the mask, only its shape
        this.maskShape.drawRect(0, 0, width, height); // Example: A rectangular clip region
        // Or maskShape.drawCircle(100, 100, 50); for a circular clip
        // Or any other complex shape using drawPolygon, drawEllipse, etc.
        this.maskShape.endFill();

        this.mask = this.maskShape;
        this.addChild(this.maskShape);

        this.container = new PIXI.Container();
        this.addChild(this.container);


    }

    resize() {
        const scaleX = window.innerWidth / this.desiredWidth;
        const scaleY = window.innerHeight / this.desiredHeight;
        const scale = Math.min(scaleX, scaleY);

        this.scale.set(scale);
       
        // Center the stage if needed
        this.x = (window.innerWidth - (this.desiredWidth * scale)) / 2;
        this.y = (window.innerHeight - (this.desiredHeight * scale)) / 2;
    }

    scroll(x, y) {
        this.container.x = x;
        this.container.y = y;
    }

    next() {
        if (this.container.children.length <= this.index) {
            this.container.addChild(new PIXI.Sprite());
        }
        let sprite = this.container.children[this.index++];
        sprite.tint = 0xffffff;
        sprite.visible = true;
        return sprite;
    }

    begin() {
        this.index = 0;
    }

    end() {
        // run though the rest of the unused sprites and set to visible false!
        for (let i = this.index; i < this.container.children.length; ++i) {
            this.container.children[i].visible = false;
        }
    }

    text(sx, sy, text, color=15) {
        if (!this.ascii) return;
        let x = sx;
        let y = sy;
        for (let i = 0; i < text.length; ++i) {
            if (text.charAt(i) == '\n') {
                y += 8;
            } else {
                let s = this.next();
                s.x = x;
                s.y = y;
                s.texture = this.ascii[text.charCodeAt(i) + color * 256];
                x += 8;
            }
        }
    }
}