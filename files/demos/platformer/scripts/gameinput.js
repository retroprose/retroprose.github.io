class GameInput extends BasicInput {

    constructor() {
        super();

        this.list = {};

        this.left = false;
        this.right = false;

        window.onpointerdown = (e) => {
            this.list[e.pointerId] = {
                x: e.clientX,
                y: e.clientY
            };
        };
        window.onpointerup = (e) => {
            delete this.list[e.pointerId];
        };
        window.onpointermove = (e) => {
            const id = e.pointerId;
            if (id in this.list) {
                this.list[id].x = e.clientX;
                this.list[id].y = e.clientY;
            }
        };
    }

    resize() {

    }

    update(delta) {
        
        this.left = false;
        this.right = false;

        for (let k in this.list) {
            if (this.list[k].x <= window.innerWidth / 2) {
                this.left = true;
            }
            if (this.list[k].x > window.innerWidth / 2) {
                this.right = true;
            }
        }

    }
    
}