class ScreenEditor extends PIXI.Container {

    constructor() {
        super();

        this.ascii = undefined;
        PIXI.Assets.load('../../images/ascii-sprite.json').then((texture) => {
            this.ascii = [];
            for (const key in texture.textures) {
                let num = parseInt(key.replace("ascii", ""));
                this.ascii[num] = texture.textures[key];
            }
        });

        this.container = new PIXI.Container();
        this.addChild(this.container);
    }
 
    next() {
        if (this.container.children.length <= this.index) {
            this.container.addChild(new PIXI.Sprite());
        }
        let sprite = this.container.children[this.index++];
        sprite.tint = 0xffffff;
        sprite.visible = true;
        sprite.rotation = 0.0;
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

    text(sx, sy, text, color=0xffffff) {
        if (!this.ascii) return;
        let x = sx;
        let y = sy;
        for (let i = 0; i < text.length; ++i) {
            if (text.charAt(i) == '\n') {
                y += 16;
            } else {
                let s = this.next();
                s.x = x;
                s.y = y;
                s.texture = this.ascii[text.charCodeAt(i)];
                s.tint = color;
                x += 8;
            }
        }
    }
}