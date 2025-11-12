class SportInput extends BasicInput {

    constructor() {
        super();
    }

    setContainer(c) {

        this.container = c;
        this.container.eventMode = 'dynamic';

        this.touchDown = false;
        this.xPos = 0.0;
        this.yPos = 0.0;

        this.container.on('pointerdown', (e) => {
            this.touchDown = true;
            let local = this.container.toLocal(e.global);
            this.xPos = local.x;
            this.yPos = local.y;
            //this.xPos = e.client.x;
            //this.yPos = e.client.y;
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
                let local = this.container.toLocal(e.global);
                this.xPos = local.x;
                this.yPos = local.y;
                //this.xPos = e.client.x;
                //this.yPos = e.client.y;
            }
        });

    }

    resize() {

    }

    update(delta) {
        
    }
    
}