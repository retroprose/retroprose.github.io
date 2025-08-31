class EditorState {

    constructor(input, output, result) {
        this.input = input;
        this.output = output;
        this.result = result;
        this.next = undefined;

        this.posX = 0;
        this.posY = 0;
        this.scaled = 1;


        this.clearAllSprites();
        
        this.clickFunc = this.clickFunc.bind(this);

        let sprite = new PIXI.Sprite(this.output.bomberTexture.textures['full-sheet']);
        /*sprite.eventMode = 'static'; 
        sprite.on('click', (event) => {
            const localCoordinates = sprite.toLocal(event.data.global);
            const x = localCoordinates.x;
            const y = localCoordinates.y;

            console.log(`Click relative to myDisplayObject: x=${x}, y=${y}`);
        });*/
        this.output.stage.addChild(sprite);

        this.output.canvas.addEventListener('click', this.clickFunc);

    }

    dispose() {
        this.canvas.removeEventListener('click', this.clickFunc);
        this.clearAllSprites();
    }

    clickFunc(event) {
        /*const rect = this.output.canvas.getBoundingClientRect();
        const x = event.clientX - rect.x;
        const y = event.clientY - rect.y;
        console.log(rect);
        console.log("x: " + x + " y: " + y);*/

        const ratio = 960.0 / 540.0;
        const rect = this.output.canvas.getBoundingClientRect();
        const rectRatio = rect.width / rect.height;
        let scale;
        let newRect;
        if (rectRatio < ratio) {
            // widths are equal
            const realHeight = rect.width * 540.0 / 960.0;
            scale = 960.0 / rect.width;
            newRect = new DOMRect(
                rect.x, 
                rect.y + ((rect.height - realHeight) / 2.0), 
                rect.width, 
                rect.realHeight
            );
        } else {
            // heights are equal
            const realWidth = rect.height * 960.0 / 540.0;
            scale = 540.0 / rect.height;
            newRect = new DOMRect(
                rect.x + ((rect.width - realWidth) / 2.0), 
                rect.y, 
                rect.realWidth, 
                rect.height
            );
        }
        const x = (event.clientX - newRect.x) * scale;
        const y = (event.clientY - newRect.y) * scale;
        console.log("x: " + x + " y: " + y);
    }

    clearAllSprites() {
        for (var i = this.output.stage.children.length - 1; i >= 0; i--) { this.output.stage.removeChild(this.output.stage.children[i]); };
    }

    update(delta) {
        // if explicit quit or socket closes for any reason
        if (this.input['Delete']) {
            this.next = "SelectRoom";
            this.result = "Error";
            return;
        }

        const s = 1;

        if (this.input['UpArrow']) this.posY -= s;
        if (this.input['DownArrow']) this.posY += s;
        if (this.input['LeftArrow']) this.posX -= s;
        if (this.input['RightArrow']) this.posX += s;

        this.output.stage.x = this.posX;
        this.output.stage.y = this.posY;
        this.output.stage.scale.set(this.scaled);

        
    }

}
