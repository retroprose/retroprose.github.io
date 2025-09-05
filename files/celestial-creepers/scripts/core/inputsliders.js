class InputSliders extends BasicInput {

    constructor() {
        super();

        this.left = 0.0;
        this.right = 0.0;
        this.tapLeft = 0.0;
        this.tapRight = 0.0;

        this.sidePadding = 50;
        this.sliderHeight = 0;

        this.padWidth = 50;
        this.padHeight = 25;

        this.pixel = new PIXI.GraphicsContext().rect(-1, -1, 2, 2).fill(0xffffff);

        this.leftSlider = new PIXI.Graphics(this.pixel);
        this.leftSlider.scale.x = 10;
        this.leftSlider.tint = 0xc8c8c8;

        this.rightSlider = new PIXI.Graphics(this.pixel);
        this.rightSlider.scale.x = 10;
        this.rightSlider.tint = 0xc8c8c8;

        this.leftBar = new PIXI.Graphics(this.pixel);
        this.leftBar.scale.x = this.padWidth;
        this.leftBar.scale.y = this.padHeight;
        this.leftBar.tint = 0xa0a0a0;
        this.leftBar.eventMode = 'static';

        this.rightBar = new PIXI.Graphics(this.pixel);
        this.rightBar.scale.x = this.padWidth;
        this.rightBar.scale.y = this.padHeight;
        this.rightBar.tint = 0xa0a0a0;
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
                if (this.leftBar.y < this.leftSlider.y - this.sliderHeight) {
                    this.leftBar.y = this.leftSlider.y - this.sliderHeight;
                }
                if (this.leftBar.y > this.leftSlider.y + this.sliderHeight) {
                    this.leftBar.y = this.leftSlider.y + this.sliderHeight;
                }

                const dy = this.leftBar.y - this.leftSlider.y;
                const slope = 32767 / (this.sliderHeight * 2);
                this.left = 32767 - (slope * (dy + this.sliderHeight));
                if (this.left < 0) this.left = 0;

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
                if (this.rightBar.y < this.rightSlider.y - this.sliderHeight) {
                    this.rightBar.y = this.rightSlider.y - this.sliderHeight;
                }
                if (this.rightBar.y > this.rightSlider.y + this.sliderHeight) {
                    this.rightBar.y = this.rightSlider.y + this.sliderHeight;
                }

                const dy = this.rightBar.y - this.rightSlider.y;
                const slope = 32767 / (this.sliderHeight * 2);
                this.right = 32767 - (slope * (dy + this.sliderHeight));
                if (this.right < 0) this.right = 0;

                console.log('right ', this.right);

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
        this.sliderHeight = (window.innerHeight - 60) / 2;
        
        this.leftSlider.y = window.innerHeight / 2;
        this.rightSlider.y = window.innerHeight / 2;

        this.leftSlider.scale.y = this.sliderHeight;
        this.rightSlider.scale.y = this.sliderHeight;

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