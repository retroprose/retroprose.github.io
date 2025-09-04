window.factory = {
    'SelectState': SelectState,
    'OfflineState': OfflineState,
    'ConnectedState': ConnectedState
};

class App {

    async init() {
        // await this so that we know the module is already loaded!
        await (() => {
            return new Promise(resolve => {
                Module.onRuntimeInitialized = function() {
                    resolve();
                };
            });    
        })();

        // initialize pixi.js
        this.pixi = new PIXI.Application();
        await this.pixi.init({ background: '#000000', resizeTo: window });
        document.body.appendChild(this.pixi.canvas);
        PIXI.TextureStyle.defaultOptions.scaleMode = 'nearest';

        // create first object
        this.thing = new window.factory['SelectState']({next:'SelectState'});
        this.pixi.stage.addChild(this.thing);

        window.addEventListener('touchstart', (e) => e.preventDefault());
        window.addEventListener('touchend', (e) => e.preventDefault());

        window.addEventListener('keydown', (event) => {
            if (event.key == '`') {
                if (this.pixi.canvas.requestFullscreen) {
                    this.pixi.canvas.requestFullscreen();
                } else if (this.pixi.canvas.webkitRequestFullscreen) { // Safari
                    this.pixi.canvas.webkitRequestFullscreen();
                } else if (this.pixi.canvas.msRequestFullscreen) { // IE11
                    this.pixi.canvas.msRequestFullscreen();
                }
            }
        });

        window.addEventListener("resize", () => this.thing.resize());
        this.thing.resize();

        // get the update loop started!
        requestAnimationFrame(this.update.bind(this));
    }
    
    update(delta) {
        this.thing.update(delta);
        if (this.thing.returned) {
            console.log(this.thing.returned);
            this.pixi.stage.removeChild(this.thing);
            let n = new window.factory[this.thing.returned.next](this.thing.returned);
            this.thing.destroy();
            this.thing = n;
            this.pixi.stage.addChild(this.thing);
            this.thing.resize();
        }
        requestAnimationFrame(this.update.bind(this));
    }


}