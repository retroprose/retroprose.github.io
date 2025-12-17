class Box2dIO extends PIXI.Container {

    constructor(local) {
        super();

        this.pixel = undefined;
        PIXI.Assets.load('../shared/images/white-pixel.png').then((texture) => {
            this.pixel = texture;
        });

        this.bindInput = new Module.BindInput();
        this.game = new Module.BindGame();
        this.game.testLoadNode(window.load_default);

        this.local = local;
        this.game.setLocal(this.local);

        this.screen = new Screen(800, 600);
        this.input = new BasicInput();

        this.camX = 16;
        this.camY = 32;

        this.lastDown = false;
        this.targetX = 0.0;
        this.targetY = 0.0;

        this.background = new PIXI.Graphics();
      
        this.addChild(this.background);

        this.addChild(this.screen);
        this.screen.addChild(this.input);
        //this.addChild(this.input);
    }

    destroy() {
        super.destroy();
        this.game.delete();
        this.bindInput.delete();
    }

    resize() {
        this.background.clear(); 
        this.background.beginFill(0x4c4c4c); 
        this.background.drawRect(0, 0, window.innerWidth, window.innerHeight); 
        this.background.endFill();
        this.input.resize();
        this.screen.resize();
    }

    network(playerInput) {
        this.game.setInput(playerInput);
    }

    processInput(buffer) {

        this.input.update(0);

        // clear out all the booleans
        this.bindInput.up = false;
        this.bindInput.down = false;
        this.bindInput.left = false;
        this.bindInput.right = false;
        this.bindInput.a = false;
        this.bindInput.b = false;
        this.bindInput.x = false;
        this.bindInput.y = false;

        // set the network input to that target coordinate
        this.bindInput.axisX = 0;
        this.bindInput.axisY = 0;

        if (this.input.keyState['ArrowUp']) this.bindInput.up = true;
        if (this.input.keyState['ArrowDown']) this.bindInput.down = true;
        if (this.input.keyState['ArrowLeft']) this.bindInput.left = true;
        if (this.input.keyState['ArrowRight']) this.bindInput.right = true;

        if (this.input.keyState['i']) this.camY += 1;
        if (this.input.keyState['k']) this.camY -= 1;
        if (this.input.keyState['j']) this.camX -= 1;
        if (this.input.keyState['l']) this.camX += 1;

        if (this.input.keyState['z']) this.bindInput.x = true;
        if (this.input.keyState['x']) this.bindInput.y = true;

        if (this.input.keyState[' ']) this.bindInput.a = true;
       
       // this.bindInput.x = this.input.wheelRadians;
       // this.bindInput.y = this.input.gasPetal;
        
        if (this.input.touchDown == true && this.lastDown == false) {
            this.targetX = this.input.xPos;
            this.targetY = this.input.yPos;
        }
        if (this.input.touchDown) {
            let dx = (this.input.xPos - this.targetX) / this.input.radius;
            let dy = (this.input.yPos - this.targetY) / this.input.radius;

            //console.log(this.input.xPos + ", " + this.input.yPos + " - " + this.targetX + ", " + this.targetY);

            let len = Math.sqrt(dx * dx + dy * dy);

            if (len > 1.0) {
                dx = dx / len;
                dy = dy / len;
                len = 1.0;
            }

            dy = -dy;  // input has positive y down :(

            this.outputX = dx;
            this.outputY = dy;

            if (len > 0.001) {
                let slope = 1.0 * (32767 - -32767) / (1.0 - -1.0);
                this.bindInput.axisX = -32767 + slope * (dx - -1.0);
                this.bindInput.axisY = -32767 + slope * (dy - -1.0);
            }
        }
    
        if (window.loadjson !== undefined) {
            // Example usage:
            fetch('../data/' + window.loadjson + '.json', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            })
            .then(response => response.json())
            .then(response => this.game.testLoadNode(response));

            window.loadjson = undefined;
        }
        
        if (window.savejson !== undefined) {
            let saveObject = this.game.testSaveNode();
            console.log(saveObject);
            
            window.savejson = undefined;
        }
        // I'm using the bomb boolean for if the player has a finger down
        //if (this.input.touchDown == true) this.bindInput.bomb = true;
       
        //console.log(this.bindInput.axisX + ", " + this.bindInput.axisY);

        this.game.getInput(this.bindInput, buffer);
    }

    update() {
        let gameOver = this.game.update();
        this.lastDown = this.input.touchDown;
        return gameOver;
    }

    render() {
        if (!this.pixel) { return; }

        this.screen.begin();

        // find rotated point
        let cX = this.game.getCameraX();
        let cY = this.game.getCameraY();
        let cA = this.game.getCameraAngle();
        let cSin = Math.sin(-cA);
        let cCos = Math.cos(-cA);

        let rX = cX * cCos - cY * cSin;
        let rY = cX * cSin + cY * cCos;

        
        this.screen.scroll(270, 480);
        // scroll screen to camera position
        //this.screen.scroll(-rX + 270, -rY + 480 + 240);
        //this.screen.scroll(-rX * 20, -rY * 20);
        let zoom = this.game.getCameraScale();
        this.screen.scroll(-rX * zoom + 270, -rY * zoom + 480 + 240 + 120);
        this.screen.rotate(-cA);
        //this.screen.zoom(zoom);
        this.screen.container.scale.set(zoom, -zoom);

        //this.screen.scroll(8.0 * 20, 72.0 / 2 * 20);
        //this.screen.zoom(20);

        let newZoom = 20;
        //this.screen.scroll(16 * newZoom, 32 * newZoom);
        this.screen.scroll(this.camX * newZoom, this.camY * newZoom);
        this.screen.rotate(0);
        //this.screen.zoom(newZoom);
        this.screen.container.scale.set(newZoom, -newZoom);

        this.game.begin();

        while ( this.game.next() ) {
            let s = this.screen.next();
            s.texture = this.pixel;
            s.anchor.set(0.5);
            s.alpha = 1.0;
            s.tint = this.game.color;
            s.x = this.game.position_x;
            s.y = this.game.position_y;
            s.width = this.game.size_x;
            s.height = this.game.size_y;
            s.rotation = this.game.rotation;
        }

        //this.screen.text(this.game.getCameraX(), this.game.getCameraY(), "coord: " + this.outputX + ", " + this.outputY);

        this.screen.end();
    }


}