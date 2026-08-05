class Screen extends PIXI.Container {

    constructor(width, height) {
        super();

        this.finalScale = 1.0;
        this.desiredWidth = width;
        this.desiredHeight = height;

        this.background = new PIXI.Graphics();
        this.background.beginFill(0x000000); // The fill color doesn't matter for the mask, only its shape
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

        //this.stars2Scale = 4;
        //this.stars2 = new PIXI.Container();
        //this.addChild(this.stars2);

        this.starsScale = 2;
        this.stars = new PIXI.Container();
        this.addChild(this.stars);

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
        //this.finalScale = 1.0;

        //console.log(this.finalScale);

        this.scale.set(this.finalScale);
        
        // Center the stage if needed
        this.x = (window.innerWidth - (this.desiredWidth * this.finalScale)) / 2;
        this.y = (window.innerHeight - (this.desiredHeight * this.finalScale)) / 2;
    }

    scroll(x, y) {
        //this.container.x = 1376;
        //this.container.y = 1378;

        this.container.x = x;
        this.container.y = y;

        //console.log(this.container.x + ", " + this.container.y + " - " + this.stars.x + ", " + this.stars.y);

        this.stars.x = x / this.starsScale;
        this.stars.y = y / this.starsScale;

        //this.stars2.x = x / this.stars2Scale;
        //this.stars2.y = y / this.stars2Scale;
    }

    rotate(a) {
        this.container.rotation = a;

        this.stars.rotation = a;
        //this.stars2.rotation = a;
    }

    zoom(s) {
        // this.container.scale.set(s, -s);
        this.container.scale.set(s);

        this.stars.scale.set(s);
        //this.stars2.scale.set(s);
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