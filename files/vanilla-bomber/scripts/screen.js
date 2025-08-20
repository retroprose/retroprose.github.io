class Screen {

    async init() {
        // Create the application helper and add its render target to the page
        let app = new PIXI.Application();

        await app.init({ background: '#000000', width: 960, height: 540 });

        document.body.appendChild(app.canvas);

        this.canvas = app.canvas;
        this.index = 0;
        this.stage = app.stage;
        this.width = 960;
        this.height = 540;

        this.asciiTexture = await PIXI.Assets.load('../images/tilemap-sprite.json');
        this.bomberTexture = await PIXI.Assets.load('../images/bomber-sprite.json');
    
        this.ascii = [];
        for (const key in this.asciiTexture.textures) {
            this.ascii[parseInt(key)] = this.asciiTexture.textures[key];
        }

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
        if (this.stage.children.length <= this.index) {
            this.stage.addChild(new PIXI.Sprite());
        }
        let sprite = this.stage.children[this.index++];
        sprite.visible = true;
        return sprite;
    }

    reset() {
        this.index = 0;
    }

    complete() {
        // run though the rest of the unused sprites and set to visible false!
        for (let i = this.index; i < this.stage.children.length; ++i) {
            this.stage.children[i].visible = false;
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