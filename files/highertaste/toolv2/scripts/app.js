
class TextureLoader {
    constructor() {
        this.backgroud = null;
        this.border = null;
        this.loading = null;
        this._food = {};
    }

    async load(data) {
        this.backgroud = await PIXI.Assets.load('./images/screen_final.png');
        this.border = await PIXI.Assets.load('./images/border.png');
        this.loading = await PIXI.Assets.load('./images/loading.png');
        for (let item in data) {
            this._food[item] = await PIXI.Assets.load(`./images/icons/${item}.png`);
        }
        this._food['__loading__'] = this.loading;
    }

    food(name) {
        return this._food[name];
    }
};

class Screen extends PIXI.Container {
    constructor(width, height) {
        super();
        this.finalScale = 1.0;
        this.desiredWidth = width;
        this.desiredHeight = height;
    }
    resize() {
        const scaleX = window.innerWidth / this.desiredWidth;
        const scaleY = window.innerHeight / this.desiredHeight;
        this.finalScale = Math.min(scaleX, scaleY);

        this.scale.set(this.finalScale);
       
        // Center the stage if needed
        this.x = (window.innerWidth - (this.desiredWidth * this.finalScale)) / 2;
        this.y = (window.innerHeight - (this.desiredHeight * this.finalScale)) / 2;
    }
}

class Icon extends PIXI.Container {
    constructor(name, tex) {
        super();
        let border;
        border = new PIXI.Sprite(tex.border);
        border.anchor.set(0.5);
        this.addChild(border);
        this.sprite = new PIXI.Sprite(tex.food(name));
        this.sprite.anchor.set(0.5);
        this.addChild(this.sprite);
    }
    set(name, tex) {
        this.sprite.texture = tex.food(name);
    }
}

class Container extends PIXI.Container {
    constructor(x, y, width, height) {
        super();

        this.blockx = false;
        this.blocky = false;

        this.x = x;
        this.y = y;

        this.row = 0;
        this.col = 0;
        this.pitch = Math.floor(width / 80);

        this.map = {};
        this.list = Object.keys(this.map);

        this.maskShape = new PIXI.Graphics();
        this.maskShape.beginFill(0xffffff); // The fill color doesn't matter for the mask, only its shape
        this.maskShape.drawRect(0, 0, width, height); // Example: A rectangular clip region
        // Or maskShape.drawCircle(100, 100, 50); for a circular clip
        // Or any other complex shape using drawPolygon, drawEllipse, etc.
        this.maskShape.endFill();

        this.mask = this.maskShape;
        this.addChild(this.maskShape);

        this.container = new PIXI.Container();
        this.addChild(this.container);

        this.velx = 0;
        this.vely = 0;
    }

    refresh() {
        this.col = this.list.length;
        this.row = 1;
        if (this.pitch > 0) {
            this.col = this.pitch;
            this.row = Math.floor(this.list.length / this.pitch);
            if (this.list.length % this.pitch != 0) {
                this.row += 1;
            }
        }
        let index = 0;
        for (let j = 0; j < this.row; ++j) {
            for (let i = 0; i < this.col; ++i) {
                if (index < this.list.length) {
                    let sprite = this.map[this.list[index]];
                    sprite.x = i * 80 + 40;
                    sprite.y = j * 80 + 40;
                    ++index;
                }
            }
        }
    }

    addIcon(name, tex) {
        if ( !(name in this.map) ) {
            let sprite = new Icon(name, tex)
            this.map[name] = sprite;
            this.list = Object.keys(this.map);
            this.container.addChild(sprite);
        }
    }

    removeIcon(name) {
        let sprite = this.map[name];
        this.container.removeChild(sprite);
        delete this.map[name];
        this.list = Object.keys(this.map);
        // sprite.delete();
        this.refresh();
    }
    
    removeAll() {
        for (let key in this.map) {
            this.container.removeChild(this.map[key]);
        }
        this.map = {};
        this.list = [];
        this.refresh();
    }

    getIcon(col, row) {
        if (col < 0 || col >= this.col) { return '__loading__'; }
        if (row < 0 || row >= this.row) { return '__loading__'; }
        return this.list[row * this.pitch + col];
    }

    hit(x, y) {
        if (
            x < this.x ||
            y < this.y ||
            x > this.x + this.maskShape.width ||
            y > this.y + this.maskShape.height
        ) {
            return false;
        }
        return true;
    }

    update(delta) {
       
    }


}


class App {

    async init() {
        // initialize pixi.js
        this.pixi = new PIXI.Application();
        await this.pixi.init({ background: '#000000', resizeTo: window });
        document.body.appendChild(this.pixi.canvas);
        // window.__PIXI_APP__ = this.pixi;

        this.data = window.load_default;
        this.textureLoader = new TextureLoader();
        await this.textureLoader.load(window.load_default);

        // create first object
        window.addEventListener('touchstart', (e) => e.preventDefault());
        window.addEventListener('touchend', (e) => e.preventDefault());
        window.addEventListener("resize", () => this.screen.resize() );

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

        this.screen = new Screen(1920, 1080);
        this.pixi.stage.addChild(this.screen);
        this.screen.resize();

        this.screen.addChild(new PIXI.Sprite(this.textureLoader.backgroud));

        this.containerList = [];

        this.store = new Container(0, 105, 690, 490);
        this.store.blockx = true;
        this.containerList.push(this.store);
        this.screen.addChild(this.store);

        this.pantry = new Container(1158, 105, 762, 480);
        this.pantry.blockx = true;
        this.containerList.push(this.pantry);
        this.screen.addChild(this.pantry);

        this.table = new Container(472, 694, 929, 386);
        this.table.blockx = true;
        this.containerList.push(this.table);
        this.screen.addChild(this.table);

        this.field = new Container(0, 686, 467, 394);
        this.field.blockx = true;
        this.containerList.push(this.field);
        this.screen.addChild(this.field);

        this.garden = new Container(1401, 691, 519, 389);
        this.garden.blockx = true;
        this.containerList.push(this.garden);
        this.screen.addChild(this.garden);

        this.pot = new Container(695, 106, 458, 490);
        this.pot.blockx = true;
        this.containerList.push(this.pot);
        this.screen.addChild(this.pot);

        this.search = new Container(130, 0, 1790, 100);
        this.search.pitch = 0;
        this.search.blocky = true;
        this.containerList.push(this.search);
        this.screen.addChild(this.search);

        this.drag = new Icon('loading', this.textureLoader);
        this.drag.visible = false;
        this.screen.addChild(this.drag);

        this.text = new PIXI.Text({
            text: '__loading__',
            style: {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: 0x000000, // red color in hex
                align: 'center',
            }
        });
        this.text.visible = false;
        this.screen.addChild(this.text);

        // add icons to store
        let mapList = [];
        for (let key in window.load_default) {
            let item = window.load_default[key];
            if (key.includes('_plant') || item.isRecipe === true) {
                // don't add it
            } else {
                mapList.push(key);
            }
        }
        mapList.sort();
        
        for (let i = 0; i < mapList.length; i++) {
            this.search.addIcon(mapList[i],  this.textureLoader);
        }
        this.search.refresh();

        let map = {};
        this.recurseAdd('stuffed_tomatoes', map);
        this.recurseAdd('vegetable_quiche', map);
        this.recurseAdd('green_beans_almondine', map);
        this.recurseAdd('vegetable_rice_casserole', map);
        this.recurseAdd('fruit_juice_gel', map);
        let mapKeys = Object.keys(map);
        mapKeys.sort();
        for (let item in mapKeys) {
            this.store.addIcon(mapKeys[item], this.textureLoader);
        }
        this.store.refresh();

        // touch screen logic
        this.state = {
            pointer: null,
            count: 0,
            name: '__loading__',
            type: 'none',
            timer: 0
        }
        window.onpointerdown = (e) => {
            this.state.count++;
            if (this.state.pointer == null) {
                let dx = ((e.clientX - this.screen.x) / this.screen.finalScale);
                let dy = ((e.clientY - this.screen.y) / this.screen.finalScale);
                if (dx < 841 || dy < 508 || dx > 1029 || dy > 567) {
                    let container = this.getContainer(e.clientX, e.clientY);
                    let sx = 0;
                    let sy = 0;
                    if (container != null) {
                        sx = container.container.x;
                        sy = container.container.y;
                    }
                    this.state.pointer = {
                        id: e.pointerId,
                        x: e.clientX,
                        y: e.clientY,
                        cx: e.clientX,
                        cy: e.clientY,
                        sx: sx,
                        sy: sy,
                        container: container
                    }
                    this.state.timer = 0;
                } else {
                    // do the cooking!
                    console.log('cooked!');
                    let matches = this.getMatches(this.pot.map);
                    console.log(matches);
                    this.pot.removeAll();
                    for (let item in matches) {
                        this.pot.addIcon(matches[item], this.textureLoader);
                    }
                    this.pot.refresh();
                    // add everything that can be made with the ingredients!
                }
            }
        };
        window.onpointerup = (e) => { this.pointerup(e); };
        window.onpointercancel = (e) => { this.pointerup(e); };
        window.onpointermove = (e) => {
            if (this.state.pointer != null && this.state.pointer.id == e.pointerId) {
                this.state.pointer.cx = e.clientX;
                this.state.pointer.cy = e.clientY;
                if (this.state.pointer.container != null) {
                    if (this.state.type == 'scroll') {
                        if (this.state.pointer.container.blockx == false) {
                            this.state.pointer.container.container.x = (e.clientX - this.state.pointer.x) + this.state.pointer.sx;
                        }
                        if (this.state.pointer.container.blocky == false) {
                            this.state.pointer.container.container.y = (e.clientY - this.state.pointer.y) + this.state.pointer.sy;
                        }
                    } else if (this.state.type == 'move') {
                        this.drag.x = ((e.clientX - this.screen.x) / this.screen.finalScale);
                        this.drag.y = ((e.clientY - this.screen.y) / this.screen.finalScale) - 72;
                        this.text.x = this.drag.x;
                        this.text.y = this.drag.y;
                    }
                }
            }
        };

        // get the update loop started!
        requestAnimationFrame(this.update.bind(this));
    }
    
    pointerup(e) {
        this.state.count--;
        if (this.state.pointer != null && this.state.pointer.id == e.pointerId) {

            // this will kick off an animation!
            let container = this.getContainer(e.clientX, e.clientY);
            if (container != null && this.state.pointer.container != null) {
                if (container != this.search && this.state.pointer.container == this.search) {
                    if (this.state.name != '__loading__') {
                        container.addIcon(this.state.name, this.textureLoader);
                        container.refresh();
                    }
                }
                if (container == this.search && this.state.pointer.container != this.search) {
                    if (this.state.name != '__loading__') {
                        this.state.pointer.container.removeIcon(this.state.name);
                        this.state.pointer.container.refresh();
                    }
                }
                if (container == this.pot) {
                    if (this.state.name != '__loading__') {
                        container.addIcon(this.state.name, this.textureLoader);
                        container.refresh();
                    }
                }
                if (container == this.table) {
                    if (this.state.name != '__loading__') {
                        container.addIcon(this.state.name, this.textureLoader);
                        container.refresh();
                        if (this.state.pointer.container == this.pot) {
                            // remove everything from the pot!
                            this.pot.removeAll();
                        }
                    }
                }
                

            }
            this.state.pointer = null;
            this.state.type = 'none';
            this.drag.visible = false;
            this.text.visible = false;

        }
    }

    recurseAdd(name, map) {
        if (Object.hasOwn(this.data[name], 'list')) {
            for (let item in this.data[name].list) {
                let innerName = this.data[name].list[item];
                map[innerName] = true;
                this.recurseAdd(innerName, map);
            }
        }
        return map;
    }

    getMatches(map) {
        console.log(map);
        let matches = [];
        for (let key in this.data) {
            console.log(key + ": ");
            if (Object.hasOwn(this.data[key], 'list')) {
                let match = true;
                for (let item in this.data[key].list) {
                    console.log(this.data[key].list[item]);
                    if (!(this.data[key].list[item] in map)) {
                        match = false;
                        console.log('FALSE!');
                    }
                }
                if (match == true) {
                    console.log("PUSHED: " + key);
                    matches.push(key);
                }
            }
        }
        return matches;
    }
    
    getContainer(x, y) {
        let container = null;
        for (let item in this.containerList) {
            let dx = ((x - this.screen.x) / this.screen.finalScale);
            let dy = ((y - this.screen.y) / this.screen.finalScale);
            if (this.containerList[item].hit(dx, dy)) {
                container = this.containerList[item];
            }
        }
        return container;
    }

    update(delta) {
        for (let index in this.containerList) {
            this.containerList[index].update();
        }
        this.state.timer += delta;
        if (this.state.type == 'none') {
            if (this.state.timer > 1000000 / 10) {
                if (this.state.pointer != null) {
                    if (this.state.pointer.container != null) {
                        this.state.type = 'move';
                        this.drag.visible = true;
                        this.text.visible = true;
                        
                        let dx = ((this.state.pointer.x - this.screen.x) / this.screen.finalScale);
                        let dy = ((this.state.pointer.y - this.screen.y) / this.screen.finalScale);

                        this.drag.x = ((this.state.pointer.cx - this.screen.x) / this.screen.finalScale);
                        this.drag.y = ((this.state.pointer.cy - this.screen.y) / this.screen.finalScale) - 72;
                        this.text.x = this.drag.x;
                        this.text.y = this.drag.y;

                        let relx = dx - this.state.pointer.container.x - this.state.pointer.container.container.x;
                        let rely = dy - this.state.pointer.container.y - this.state.pointer.container.container.y;
                        
                        let col = Math.floor(relx / 80);                
                        let row = Math.floor(rely / 80);

                        let name = this.state.pointer.container.getIcon(col, row);
                        this.drag.set(name, this.textureLoader);
                        this.state.name = name;
                        this.text.text = this.state.name;
                        if (name == '__loading__') {
                            this.drag.visible = false;
                            this.text.visible = false;
                        }
                    }
                }
            } else {
                if (this.state.count > 1) {
                    this.state.type = 'scroll';
                }
            }
        }
        requestAnimationFrame(this.update.bind(this));
    }


}