
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
        this.eventMode = 'static';
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
        this.eventMode = 'static';
        this.name = name;
        let border;
        border = new PIXI.Sprite(tex.border);
        border.anchor.set(0.5);
        this.addChild(border);
        this.sprite = new PIXI.Sprite(tex.food(name));
        this.sprite.anchor.set(0.5);
        this.addChild(this.sprite);
    }
    set(name, tex) {
        this.name = name;
        this.sprite.texture = tex.food(name);
    }
}

class Container extends PIXI.Container {
    constructor(x, y, width, height) {
        super();
        this.eventMode = 'static';

        this.x = x;
        this.y = y;

        this.row = 0;
        this.col = 0;
        
        this.map = {};
        this.list = Object.keys(this.map);

        this.maskShape = new PIXI.Graphics();
        this.maskShape.beginFill(0xffffff); 
        this.maskShape.drawRect(0, 0, width, height); 
        this.maskShape.endFill();
        this.addChild(this.maskShape);

        this.container = new PIXI.Container();
        this.addChild(this.container);
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


class VerticalContainer extends Container {
    constructor(x, y, width, height) {
        super(x, y, width, height);
        this.pitch = Math.floor(width / 80);    
    }

    refresh() {
        this.col = this.pitch;
        this.row = Math.floor(this.list.length / this.pitch);
        if (this.list.length % this.pitch != 0) {
            this.row += 1;
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

        this.store = new VerticalContainer(0, 105, 690, 490);       this.containerList.push(this.store);
        //this.pantry = new Container(1158, 105, 762, 480);   this.containerList.push(this.pantry);
        //this.table = new Container(472, 694, 929, 386);     this.containerList.push(this.table);
        //this.field = new Container(0, 686, 467, 394);       this.containerList.push(this.field);
        //this.garden = new Container(1401, 691, 519, 389);   this.containerList.push(this.garden);
        //this.pot = new Container(695, 106, 458, 490);       this.containerList.push(this.pot);
        //this.search = new Container(130, 0, 1790, 100);     this.containerList.push(this.search);

        for (var index in this.containerList) {
            this.screen.addChild(this.containerList[index]);
        }

        this.text = new PIXI.Text({
            text: '__loading__',
            style: {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: 0x000000, // red color in hex
                align: 'center',
            }
        });

        this.drag = new Icon('loading', this.textureLoader);
        this.drag.addChild(this.text);
        this.drag.visible = false;
        this.screen.addChild(this.drag);


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

        // get the update loop started!
        requestAnimationFrame(this.update.bind(this));
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

    /*getMatches(map) {
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
    }*/
    
    update(delta) {



        requestAnimationFrame(this.update.bind(this));
    }


}