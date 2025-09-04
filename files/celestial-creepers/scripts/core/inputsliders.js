class InputSliders extends BasicInput {

    constructor() {
        super();

        this.left = 0.0;
        this.right = 0.0;
        this.tapLeft = 0.0;
        this.tapRight = 0.0;

        this.sidePadding = 100;
        this.sliderHeight = 800;

        this.padWidth = 100;
        this.padHeight = 50;

        this.slider = new PIXI.GraphicsContext().rect(-10, 0, 20, this.sliderHeight).fill(0xc8c8c8);
        this.bar = new PIXI.GraphicsContext().rect(-this.padWidth / 2, -this.padHeight / 2, this.padWidth, this.padHeight).fill(0xa0a0a0);

        this.leftSlider = new PIXI.Graphics(this.slider);
        this.rightSlider = new PIXI.Graphics(this.slider);

        this.leftBar = new PIXI.Graphics(this.bar);
        this.rightBar = new PIXI.Graphics(this.bar);

        this.leftBar.eventMode = 'static';
        this.rightBar.eventMode = 'static';

        this.leftId = -1;
        this.rightId = -1; 

        // left slider
        this.leftBar.on('pointerdown', (e) => {
            // set bar to where finger is
            this.leftId = e.pointerId;
        });
        this.leftBar.on('pointerup', (e) => {
            this.leftId = -1;
        });
        this.leftBar.on('pointerupoutside', (e) => {
            this.leftId = -1;
        });
        this.leftBar.on('globalpointermove', (e) => {
            if (this.leftId == e.pointerId) {
                // set bar to where finger is
                this.leftBar.y = e.client.y;
                if (this.leftBar.y < this.leftSlider.y) {
                    this.leftBar.y = this.leftSlider.y;
                }
                if (this.leftBar.y > this.sliderHeight + this.leftSlider.y) {
                    this.leftBar.y = this.sliderHeight + this.leftSlider.y;
                }

                const dy = this.leftBar.y - this.leftSlider.y;
                const slope = 32767.0 / this.sliderHeight;
                this.left = 32767.0 - slope * dy;
                
                console.log('left ', this.left);

            }
        });

        // right slider
        this.rightBar.on('pointerdown', (e) => {
            // set bar to where finger is
            this.rightId = e.pointerId;
        });
        this.rightBar.on('pointerup', (e) => {
            this.rightId = -1;
        });
        this.rightBar.on('pointerupoutside', (e) => {
            this.rightId = -1;
        });
        this.rightBar.on('globalpointermove', (e) => {
            if (this.rightId == e.pointerId) {
                // set bar to where finger is
                this.rightBar.y = e.client.y;
                if (this.rightBar.y < this.rightSlider.y) {
                    this.rightBar.y = this.rightSlider.y;
                }
                if (this.rightBar.y > this.sliderHeight + this.rightSlider.y) {
                    this.rightBar.y = this.sliderHeight + this.rightSlider.y;
                }

                const dy = this.rightBar.y - this.rightSlider.y;
                const slope = 32767.0 / this.sliderHeight;
                this.right = 32767.0 - slope * dy;
                
                console.log('right', this.right);

            }
        });

        this.addChild(this.leftSlider);
        this.addChild(this.rightSlider);

        this.addChild(this.leftBar);
        this.addChild(this.rightBar);

        // resize
        this.resize();
    }

    resize() {
        const padding = (window.innerHeight - this.sliderHeight) / 2;

        this.leftSlider.y = padding;
        this.rightSlider.y = padding;

        this.leftSlider.x = this.sidePadding;
        this.rightSlider.x = window.innerWidth - this.sidePadding - this.rightSlider.width;

        this.leftBar.x = this.leftSlider.x;
        this.rightBar.x = this.rightSlider.x;

        this.leftBar.y = this.leftSlider.y + this.sliderHeight;
        this.rightBar.y = this.rightSlider.y + this.sliderHeight;

    }

    update(delta) {
        
    }
    
}