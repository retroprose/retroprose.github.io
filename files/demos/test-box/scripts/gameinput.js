class GameInput extends BasicInput {

    constructor() {
        super();
        
        this.touchDown = false;
        this.xPos = 0.0;
        this.yPos = 0.0;

        window.onpointerdown = (e) => {
            this.touchDown = true;
            this.xPos = e.clientX;
            this.yPos = e.clientY;
        };
        window.onpointerup = (e) => {
            this.touchDown = false;
        };
        window.onpointermove = (e) => {
            this.xPos = e.clientX;
            this.yPos = e.clientY;
        };
    }

    resize() {

    }

    update(delta) {
    
    }
    
}