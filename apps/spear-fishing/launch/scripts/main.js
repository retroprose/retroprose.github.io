class Main {


    async init(config) {

        // initilize pixi
        this.pixi = new PIXI.Application();
        await this.pixi.init({ background: '#000000', resizeTo: window });
        document.body.appendChild(this.pixi.canvas);
        PIXI.TextureStyle.defaultOptions.scaleMode = 'nearest';		

        // load textures
        this.textures = {};
        this.textures["ascii"] = await PIXI.Assets.load('./images/white-pixel.png');

        this.input = new Input(this.textures["ascii"], 50.0, 10.0, 10.0);
        this.pixi.stage.addChild(this.input);
        
        // event listeners and get main loop started
        this.resize();
        window.addEventListener("resize", () => this.resize());

        this.lastTick = 0;
        requestAnimationFrame((deltaTotal) => {
            this.lastTick = deltaTotal;
            this.update(deltaTotal);
        });

        // return this;
    }

    resize() {
        this.input.resize();
    }

    update(deltaTotal) {
        let delta = deltaTotal - this.lastTick;
        this.lastTick = deltaTotal;

        this.input.update(delta);


        requestAnimationFrame(this.update.bind(this));
    }


}