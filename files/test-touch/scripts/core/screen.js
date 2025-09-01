class Screen {

    async init() {
        // Create the application helper and add its render target to the page
        let app = new PIXI.Application();

        //await app.init({ background: '#000000', width: 960, height: 540 });
        await app.init({ background: '#000000', resizeTo: window });

        document.body.appendChild(app.canvas);

        PIXI.TextureStyle.defaultOptions.scaleMode = 'nearest';

        this.app = app;
        this.canvas = app.canvas;
        this.index = 0;
        this.stage = app.stage;
        this.width = 960;
        this.height = 540;

        this.asciiTexture = await PIXI.Assets.load('../images/tilemap-sprite.json');
        this.bomberTexture = await PIXI.Assets.load('../images/bomber-sprite.json');
        this.pixelTexture = await PIXI.Assets.load('../images/white-pixel.png');
    
        this.maskShape = new PIXI.Graphics();
        this.maskShape.beginFill(0xFFFFFF); // The fill color doesn't matter for the mask, only its shape
        this.maskShape.drawRect(0, 0, 960, 540); // Example: A rectangular clip region
        // Or maskShape.drawCircle(100, 100, 50); for a circular clip
        // Or any other complex shape using drawPolygon, drawEllipse, etc.
        this.maskShape.endFill();

        this.outerContainer = new PIXI.Container();
        this.innerContainer = new PIXI.Container();

        this.outerContainer.mask = this.maskShape;
        this.outerContainer.addChild(this.maskShape);
        this.outerContainer.addChild(this.innerContainer);

        this.stage.addChild(this.outerContainer);

        this.pad = new PIXI.Sprite(this.pixelTexture);
        this.pad.anchor.set(0.5);
        this.pad.scale.set(64);
        this.pad.tint = 0xc8c8c8;

        this.stick = new PIXI.Sprite(this.pixelTexture);
        this.stick.anchor.set(0.5);
        this.stick.scale.set(32);
        this.stick.tint = 0xffffff;

        this.button = new PIXI.Sprite(this.pixelTexture);
        this.button.anchor.set(0.5);
        this.button.scale.set(64);
        this.button.tint = 0xff0000;

        this.stage.addChild(this.button);
        this.stage.addChild(this.pad);
        this.stage.addChild(this.stick);

        this.ascii = [];
        for (const key in this.asciiTexture.textures) {
            this.ascii[parseInt(key)] = this.asciiTexture.textures[key];
        }

        window.onresize = this.resize.bind(this);

        this.resize();
    }

    resize() {
        // Example: Scale to fit the window while maintaining aspect ratio
        const desiredWidth = 960; // Your virtual game width
        const desiredHeight = 540; // Your virtual game height

        const scaleX = window.innerWidth / desiredWidth;
        const scaleY = window.innerHeight / desiredHeight;
        const scale = Math.min(scaleX, scaleY);

        this.outerContainer.scale.set(scale);
       
        // Center the stage if needed
        this.outerContainer.x = (window.innerWidth - (desiredWidth * scale)) / 2;
        this.outerContainer.y = (window.innerHeight - (desiredHeight * scale)) / 2;

        this.pad.x = 16 + (this.pad.width / 2);
        this.pad.y = window.innerHeight - 16 - (this.pad.height / 2);

        this.stick.x = 32 + (this.stick.width / 2);
        this.stick.y = window.innerHeight - 32 - (this.stick.height / 2);
        
        this.button.x = window.innerWidth - 16 - (this.button.width / 2);
        this.button.y = window.innerHeight - 16 - (this.button.height / 2);

    }

    fullScreen() {
        if (this.canvas.requestFullscreen) {
            this.canvas.requestFullscreen();
        } else if (this.canvas.webkitRequestFullscreen) { // Safari
            this.canvas.webkitRequestFullscreen();
        } else if (this.canvas.msRequestFullscreen) { // IE11
            this.canvas.msRequestFullscreen();
        }
    }

    next() {
        if (this.innerContainer.children.length <= this.index) {
            this.innerContainer.addChild(new PIXI.Sprite());
        }
        let sprite = this.innerContainer.children[this.index++];
        sprite.tint = 0xffffff;
        sprite.visible = true;
        return sprite;
    }

    reset() {
        this.index = 0;
    }

    complete() {
        // run though the rest of the unused sprites and set to visible false!
        for (let i = this.index; i < this.innerContainer.children.length; ++i) {
            this.innerContainer.children[i].visible = false;
        }
    }

    text(sx, sy, text, color=15) {
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