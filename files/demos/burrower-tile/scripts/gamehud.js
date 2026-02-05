class GameHud extends PIXI.Container {

    constructor() {
        super();

        this.ascii = undefined;
        PIXI.Assets.load('../shared/images/tilemap-sprite.json').then((texture) => {
            this.ascii = [];
            for (const key in texture.textures) {
                this.ascii[parseInt(key)] = texture.textures[key];
            }
        });


    }

    resize() {
        
    }

    next() {
        if (this.children.length <= this.index) {
            this.addChild(new PIXI.Sprite());
        }
        let sprite = this.children[this.index++];
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
        for (let i = this.index; i < this.children.length; ++i) {
            this.children[i].visible = false;
        }
    }

    text(sx, sy, text, color=15) {
        if (!this.ascii) return;
        let x = sx;
        let y = sy;
        for (let i = 0; i < text.length; ++i) {
            if (text.charAt(i) == '\n') {
                x = sx;
                y += 8;
            } else {
                let s = this.next();
                s.x = x;
                s.y = y;
                s.texture = this.ascii[text.charCodeAt(i) + color * 256];
                s.scale.set(1.0);
                x += 8;
            }
        }
    }

}