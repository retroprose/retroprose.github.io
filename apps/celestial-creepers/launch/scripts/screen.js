class Screen extends PIXI.Container {

    constructor(width, height) {
        super();

        this.finalScale = 1.0;
        this.desiredWidth = width;
        this.desiredHeight = height;

        this.background = new PIXI.Graphics();
        this.background.beginFill(0x00c800); // The fill color doesn't matter for the mask, only its shape
        this.background.drawRect(0, 0, width, height); // Example: A rectangular clip region
        this.background.endFill();
        this.addChild(this.background);

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
        this.finalScale = Math.min(scaleX, scaleY);
        //this.finalScale = Math.floor(this.finalScale);
        if (this.finalScale < 1.0) {
            //this.finalScale = 1.0;
            //this.finalScale = 0.5;
        }
        //this.finalScale = 2.0;

        //console.log(this.finalScale);

        this.scale.set(this.finalScale);
        
        // Center the stage if needed
        this.x = (window.innerWidth - (this.desiredWidth * this.finalScale)) / 2;
        this.y = (window.innerHeight - (this.desiredHeight * this.finalScale)) / 2;
    }

    scroll(x, y) {
        this.container.x = x;
        this.container.y = y;
    }

    rotate(a) {
        this.container.rotation = a;
    }

    zoom(s) {
        // this.container.scale.set(s, -s);
        this.container.scale.set(s);
    }

    next() {
        if (this.container.children.length <= this.index) {
            this.container.addChild(new PIXI.Sprite());
        }
        let sprite = this.container.children[this.index++];
        sprite.tint = 0xffffff;
        sprite.visible = true;
        sprite.alpha = 1.0;
        sprite.rotation = 0.0;
        sprite.anchor.set(0.0);
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

}