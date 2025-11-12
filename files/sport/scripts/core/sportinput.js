class SportInput extends BasicInput {

    constructor() {
        super();
    }

    setContainer(c) {

        this.container = c;

        this.touchDown = false;
        this.xPos = 0.0;
        this.yPos = 0.0;

        this.container.on('pointerdown', (e) => {
            this.touchDown = true;
            this.xPos = e.client.x;
            this.yPos = e.client.y;
        });
        this.container.on('pointerup', (e) => {
            this.touchDown = false;
            this.xPos = 0.0;
            this.yPos = 0.0;
        });
        this.container.on('pointerupoutside', (e) => {
            this.touchDown = false;
            this.xPos = 0.0;
            this.yPos = 0.0;
        });
        this.container.on('globalpointermove', (e) => {
            if (this.touchDown == true) {
                this.xPos = e.client.x;
                this.yPos = e.client.y;
            }
        });

    }

    resize() {

    }

    update(delta) {
        
    }
    
}