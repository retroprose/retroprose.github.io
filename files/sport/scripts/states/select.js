class SelectState extends PIXI.Container {

    constructor(data) {
        super();

        this.data = data;
        this.returned = false;

        for (let i = 0; i < 10; ++i) {
            let str = 'Room ' + i;
            if (i == 9) { str = 'Offline' }
            const circle = new PIXI.GraphicsContext().circle(0, 0, 50).fill(0x00ffff);
            const sprite = new PIXI.Graphics(circle);
            const text = new PIXI.Text({
                text: str,
                style: {
                    fill: '#000000',
                    fontSize: 24
                },
                anchor: 0.5
            });
            sprite.addChild(text);
            sprite.eventMode = 'static';
            sprite.on('pointertap', this.buttonPressed.bind(this, i));
            this.addChild(sprite);
        }
    }

    destroy() {
        super.destroy();
    }

    resize() {
        let cols, rows;
        if (window.innerWidth > window.innerHeight) {
            rows = 2;
            cols = 5;
        } else {
            rows = 5;
            cols = 2;
        }
        let spx = (window.innerWidth - (100 * cols)) / (cols + 1);
        let spy = (window.innerHeight - (100 * rows)) / (rows + 1);
        let index = 0;
        for (let j = 0; j < rows; ++j) {
            for (let i = 0; i < cols; ++i) {
                let s = this.getChildAt(index);
                s.x = i * (100 + spx) + spx + 50;
                s.y = j * (100 + spy) + spy + 50;
                ++index;
            }
        }
    }
    
    buttonPressed(n) {
        if (n == 9) {
            this.returned = {
                next: 'OfflineState'
            };  
        } else {
            this.returned = {
                next: 'ConnectedState',
                room: n
            };      
        }
    }

    update(delta) {
        // don't even need I don't think
    }

}