const Direction = {
    Null: 0,
    East: 1,
    SouthEast: 2,
    South: 3,
    SouthWest: 4,
    West: 5,
    NorthWest: 6,
    North: 7,
    NorthEast: 8,
    Count: 9
};

const ObjType = {
    Null: 0,
    Program: 1,
    Player: 2,
    Bomb: 3,
    Enemy: 4,
    Bullet: 5,
    BadBullet: 6,
    Boom: 7,
    Corpse: 8,
    BreakableWall: 9,
    ExplodedWall: 10,
    ExplodedPower: 11,
    PlayerBoom: 12,
    ShotCleaner: 13,
    Block: 14,
    Tilemap: 15,
    Count: 16
};

const TileType = {
    Clear: 0,
    KickedBomb: 1,
    BlockablesTier1: 2,
    PowerBomb: 3,
    PowerFire: 4,
    PowerSpeed: 5,
    PowerKick: 6,
    PowerPunch: 7,
    PowerNuke: 8,
    PowerClick: 9,
    ExplodedPower: 10,
    BlockablesTier2: 11,
    Wall: 12,
    BreakableWall: 13,
    ExplodedWall: 14,
    Bomb: 15,
    Count: 16
};

// exploded-power-{f}   [0,1,2,2,3,3,4,4,4,4,5,5,5,5,5,6,6,6,6,6,6]
// exploted-wall-{f}    [0,1,1,2,2,2,3,3,3,3,4,4,4,4,4,5,5,5,5,5,5]
// bomb-{f}             [0,0,1,1,2,2,1,1,0,0,1,1,2,2,1]
// 'c' is center, 'se' is horizontal, 'sw' is vertical
// boom-{d}-{f}         [0,1,2,2,3,3,4,4,4,3,3,2,2,1,0]
// player-{t}-{d}-{f}   [0,0,0,0,0,0,0,1,1,1,1,1,2,2,2,2,2,2,2,1,1,1,1,1,1]
// 'ne' is player death animation
// player-{t}-death-{f} [0,1,2,3,4,5,6]

const tileAnimations = {
    0: ["floor", "floor-shadow"],
    3: ["power-bomb-0", "power-bomb-1"],
    4: ["power-fire-0", "power-fire-1"],
    5: ["power-speed-0", "power-speed-1"],
    6: ["power-kick-0", "power-kick-1"],
    7: ["power-punch-0", "power-punch-1"],
    8: ["power-nuke-0", "power-nuke-1"],
    9: ["power-click-0", "power-click-1"],
    10: ["exploded-power-0","exploded-power-1","exploded-power-2","exploded-power-2","exploded-power-3","exploded-power-3","exploded-power-4","exploded-power-4","exploded-power-4","exploded-power-4","exploded-power-5","exploded-power-5","exploded-power-5","exploded-power-5","exploded-power-5","exploded-power-6","exploded-power-6","exploded-power-6","exploded-power-6","exploded-power-6","exploded-power-6"],
    12: ["wall"],
    13: ["breakable-wall"],
    15: ["bomb-0","bomb-0","bomb-1","bomb-1","bomb-2","bomb-2","bomb-1","bomb-1","bomb-0","bomb-0","bomb-1","bomb-1","bomb-2","bomb-2","bomb-1"],
    14: ["exploded-wall-0","exploded-wall-1","exploded-wall-1","exploded-wall-2","exploded-wall-2","exploded-wall-2","exploded-wall-3","exploded-wall-3","exploded-wall-3","exploded-wall-3","exploded-wall-4","exploded-wall-4","exploded-wall-4","exploded-wall-4","exploded-wall-4","exploded-wall-5","exploded-wall-5","exploded-wall-5","exploded-wall-5","exploded-wall-5","exploded-wall-5"]
};

const boomAnimations = {
    0: ["boom-c-0","boom-c-1","boom-c-2","boom-c-2","boom-c-3","boom-c-3","boom-c-4","boom-c-4","boom-c-4","boom-c-3","boom-c-3","boom-c-2","boom-c-2","boom-c-1","boom-c-0"],
    1: ["boom-e-0","boom-e-1","boom-e-2","boom-e-2","boom-e-3","boom-e-3","boom-e-4","boom-e-4","boom-e-4","boom-e-3","boom-e-3","boom-e-2","boom-e-2","boom-e-1","boom-e-0"],
    2: ["boom-se-0","boom-se-1","boom-se-2","boom-se-2","boom-se-3","boom-se-3","boom-se-4","boom-se-4","boom-se-4","boom-se-3","boom-se-3","boom-se-2","boom-se-2","boom-se-1","boom-se-0"],
    3: ["boom-s-0","boom-s-1","boom-s-2","boom-s-2","boom-s-3","boom-s-3","boom-s-4","boom-s-4","boom-s-4","boom-s-3","boom-s-3","boom-s-2","boom-s-2","boom-s-1","boom-s-0"],
    4: ["boom-sw-0","boom-sw-1","boom-sw-2","boom-sw-2","boom-sw-3","boom-sw-3","boom-sw-4","boom-sw-4","boom-sw-4","boom-sw-3","boom-sw-3","boom-sw-2","boom-sw-2","boom-sw-1","boom-sw-0"],
    5: ["boom-w-0","boom-w-1","boom-w-2","boom-w-2","boom-w-3","boom-w-3","boom-w-4","boom-w-4","boom-w-4","boom-w-3","boom-w-3","boom-w-2","boom-w-2","boom-w-1","boom-w-0"],
    7: ["boom-n-0","boom-n-1","boom-n-2","boom-n-2","boom-n-3","boom-n-3","boom-n-4","boom-n-4","boom-n-4","boom-n-3","boom-n-3","boom-n-2","boom-n-2","boom-n-1","boom-n-0"]
};

const playerAnimations = {
    1: {
        1: ["player-white-e-0","player-white-e-0","player-white-e-0","player-white-e-0","player-white-e-0","player-white-e-0","player-white-e-0","player-white-e-1","player-white-e-1","player-white-e-1","player-white-e-1","player-white-e-1","player-white-e-2","player-white-e-2","player-white-e-2","player-white-e-2","player-white-e-2","player-white-e-2","player-white-e-2","player-white-e-1","player-white-e-1","player-white-e-1","player-white-e-1","player-white-e-1","player-white-e-1"],
        3: ["player-white-s-0","player-white-s-0","player-white-s-0","player-white-s-0","player-white-s-0","player-white-s-0","player-white-s-0","player-white-s-1","player-white-s-1","player-white-s-1","player-white-s-1","player-white-s-1","player-white-s-2","player-white-s-2","player-white-s-2","player-white-s-2","player-white-s-2","player-white-s-2","player-white-s-2","player-white-s-1","player-white-s-1","player-white-s-1","player-white-s-1","player-white-s-1","player-white-s-1"],
        5: ["player-white-w-0","player-white-w-0","player-white-w-0","player-white-w-0","player-white-w-0","player-white-w-0","player-white-w-0","player-white-w-1","player-white-w-1","player-white-w-1","player-white-w-1","player-white-w-1","player-white-w-2","player-white-w-2","player-white-w-2","player-white-w-2","player-white-w-2","player-white-w-2","player-white-w-2","player-white-w-1","player-white-w-1","player-white-w-1","player-white-w-1","player-white-w-1","player-white-w-1"],
        7: ["player-white-n-0","player-white-n-0","player-white-n-0","player-white-n-0","player-white-n-0","player-white-n-0","player-white-n-0","player-white-n-1","player-white-n-1","player-white-n-1","player-white-n-1","player-white-n-1","player-white-n-2","player-white-n-2","player-white-n-2","player-white-n-2","player-white-n-2","player-white-n-2","player-white-n-2","player-white-n-1","player-white-n-1","player-white-n-1","player-white-n-1","player-white-n-1","player-white-n-1"],
        8: ["player-white-death-0","player-white-death-1","player-white-death-2","player-white-death-3","player-white-death-4","player-white-death-5","player-white-death-6"]
    },
    2: {
        1: ["player-blue-e-0","player-blue-e-0","player-blue-e-0","player-blue-e-0","player-blue-e-0","player-blue-e-0","player-blue-e-0","player-blue-e-1","player-blue-e-1","player-blue-e-1","player-blue-e-1","player-blue-e-1","player-blue-e-2","player-blue-e-2","player-blue-e-2","player-blue-e-2","player-blue-e-2","player-blue-e-2","player-blue-e-2","player-blue-e-1","player-blue-e-1","player-blue-e-1","player-blue-e-1","player-blue-e-1","player-blue-e-1"],
        3: ["player-blue-s-0","player-blue-s-0","player-blue-s-0","player-blue-s-0","player-blue-s-0","player-blue-s-0","player-blue-s-0","player-blue-s-1","player-blue-s-1","player-blue-s-1","player-blue-s-1","player-blue-s-1","player-blue-s-2","player-blue-s-2","player-blue-s-2","player-blue-s-2","player-blue-s-2","player-blue-s-2","player-blue-s-2","player-blue-s-1","player-blue-s-1","player-blue-s-1","player-blue-s-1","player-blue-s-1","player-blue-s-1"],
        5: ["player-blue-w-0","player-blue-w-0","player-blue-w-0","player-blue-w-0","player-blue-w-0","player-blue-w-0","player-blue-w-0","player-blue-w-1","player-blue-w-1","player-blue-w-1","player-blue-w-1","player-blue-w-1","player-blue-w-2","player-blue-w-2","player-blue-w-2","player-blue-w-2","player-blue-w-2","player-blue-w-2","player-blue-w-2","player-blue-w-1","player-blue-w-1","player-blue-w-1","player-blue-w-1","player-blue-w-1","player-blue-w-1"],
        7: ["player-blue-n-0","player-blue-n-0","player-blue-n-0","player-blue-n-0","player-blue-n-0","player-blue-n-0","player-blue-n-0","player-blue-n-1","player-blue-n-1","player-blue-n-1","player-blue-n-1","player-blue-n-1","player-blue-n-2","player-blue-n-2","player-blue-n-2","player-blue-n-2","player-blue-n-2","player-blue-n-2","player-blue-n-2","player-blue-n-1","player-blue-n-1","player-blue-n-1","player-blue-n-1","player-blue-n-1","player-blue-n-1"],
        8: ["player-blue-death-0","player-blue-death-1","player-blue-death-2","player-blue-death-3","player-blue-death-4","player-blue-death-5","player-blue-death-6"]
    },
    3: {
        1: ["player-black-e-0","player-black-e-0","player-black-e-0","player-black-e-0","player-black-e-0","player-black-e-0","player-black-e-0","player-black-e-1","player-black-e-1","player-black-e-1","player-black-e-1","player-black-e-1","player-black-e-2","player-black-e-2","player-black-e-2","player-black-e-2","player-black-e-2","player-black-e-2","player-black-e-2","player-black-e-1","player-black-e-1","player-black-e-1","player-black-e-1","player-black-e-1","player-black-e-1"],
        3: ["player-black-s-0","player-black-s-0","player-black-s-0","player-black-s-0","player-black-s-0","player-black-s-0","player-black-s-0","player-black-s-1","player-black-s-1","player-black-s-1","player-black-s-1","player-black-s-1","player-black-s-2","player-black-s-2","player-black-s-2","player-black-s-2","player-black-s-2","player-black-s-2","player-black-s-2","player-black-s-1","player-black-s-1","player-black-s-1","player-black-s-1","player-black-s-1","player-black-s-1"],
        5: ["player-black-w-0","player-black-w-0","player-black-w-0","player-black-w-0","player-black-w-0","player-black-w-0","player-black-w-0","player-black-w-1","player-black-w-1","player-black-w-1","player-black-w-1","player-black-w-1","player-black-w-2","player-black-w-2","player-black-w-2","player-black-w-2","player-black-w-2","player-black-w-2","player-black-w-2","player-black-w-1","player-black-w-1","player-black-w-1","player-black-w-1","player-black-w-1","player-black-w-1"],
        7: ["player-black-n-0","player-black-n-0","player-black-n-0","player-black-n-0","player-black-n-0","player-black-n-0","player-black-n-0","player-black-n-1","player-black-n-1","player-black-n-1","player-black-n-1","player-black-n-1","player-black-n-2","player-black-n-2","player-black-n-2","player-black-n-2","player-black-n-2","player-black-n-2","player-black-n-2","player-black-n-1","player-black-n-1","player-black-n-1","player-black-n-1","player-black-n-1","player-black-n-1"],
        8: ["player-black-death-0","player-black-death-1","player-black-death-2","player-black-death-3","player-black-death-4","player-black-death-5","player-black-death-6"]
    },
    4: {
        1: ["player-red-e-0","player-red-e-0","player-red-e-0","player-red-e-0","player-red-e-0","player-red-e-0","player-red-e-0","player-red-e-1","player-red-e-1","player-red-e-1","player-red-e-1","player-red-e-1","player-red-e-2","player-red-e-2","player-red-e-2","player-red-e-2","player-red-e-2","player-red-e-2","player-red-e-2","player-red-e-1","player-red-e-1","player-red-e-1","player-red-e-1","player-red-e-1","player-red-e-1"],
        3: ["player-red-s-0","player-red-s-0","player-red-s-0","player-red-s-0","player-red-s-0","player-red-s-0","player-red-s-0","player-red-s-1","player-red-s-1","player-red-s-1","player-red-s-1","player-red-s-1","player-red-s-2","player-red-s-2","player-red-s-2","player-red-s-2","player-red-s-2","player-red-s-2","player-red-s-2","player-red-s-1","player-red-s-1","player-red-s-1","player-red-s-1","player-red-s-1","player-red-s-1"],
        5: ["player-red-w-0","player-red-w-0","player-red-w-0","player-red-w-0","player-red-w-0","player-red-w-0","player-red-w-0","player-red-w-1","player-red-w-1","player-red-w-1","player-red-w-1","player-red-w-1","player-red-w-2","player-red-w-2","player-red-w-2","player-red-w-2","player-red-w-2","player-red-w-2","player-red-w-2","player-red-w-1","player-red-w-1","player-red-w-1","player-red-w-1","player-red-w-1","player-red-w-1"],
        7: ["player-red-n-0","player-red-n-0","player-red-n-0","player-red-n-0","player-red-n-0","player-red-n-0","player-red-n-0","player-red-n-1","player-red-n-1","player-red-n-1","player-red-n-1","player-red-n-1","player-red-n-2","player-red-n-2","player-red-n-2","player-red-n-2","player-red-n-2","player-red-n-2","player-red-n-2","player-red-n-1","player-red-n-1","player-red-n-1","player-red-n-1","player-red-n-1","player-red-n-1"],
        8: ["player-red-death-0","player-red-death-1","player-red-death-2","player-red-death-3","player-red-death-4","player-red-death-5","player-red-death-6"]
    }
};


class BomberIO extends PIXI.Container {

    constructor(local) {
        super();

        this.pixel = undefined;
        PIXI.Assets.load('../shared/images/white-pixel.png').then((texture) => {
            this.pixel = texture;
        });

        this.bomberTexture = undefined;
        PIXI.Assets.load('../bomberman/images/bomber-sprite.json').then((texture) => {
            this.bomberTexture = texture;
        });

        this.returned = undefined;
        this.local = local;

        this.aniCounter1 = 0;
        this.aniToggle1 = false;

        this.game = new Module.BindGame();
        this.entity = new Module.BindEntity();
        this.bindInput = new Module.BindInput();

        this.input = new InputStick();
        this.output = new Screen(960, 540);

        this.toggleControl = this.toggleControl.bind(this);
        window.addEventListener('keydown', this.toggleControl);

        this.addChild(this.output);
        this.addChild(this.input);

        this.resetInput();
    }

    destroy() {
        super.destroy();
        window.removeEventListener('keydown', this.toggleControl);
        this.game.delete();
        this.entity.delete();
        this.bindInput.delete();
    }

    resize() {
        this.input.resize();
        this.output.resize();
    }

    toggleControl(event) {
        if (event.key == '1') {
            this.input.visible = !this.input.visible;
        }
    }

    network(playerInput) {
        this.game.setInput(playerInput);
        this.resetInput();
    }

    resetInput() {
        this.bindInput.up = false;
        this.bindInput.down = false;
        this.bindInput.left = false;
        this.bindInput.right = false;
        this.bindInput.bomb = false;
        this.bindInput.punch = false;
        this.bindInput.kick = false;
        this.bindInput.detonate = false;
    }

    processInput(buffer) {
        this.game.getInput(this.bindInput, buffer);
        this.resetInput();
    }

    updateDelta(delta) {

        this.input.update(delta);
        
        for (const gamepad of navigator.getGamepads()) {
            if (!gamepad) continue;
            if (gamepad.buttons.length < 16) continue;

            if (gamepad.buttons[12].pressed) this.bindInput.up = true;
            if (gamepad.buttons[13].pressed) this.bindInput.down = true;
            if (gamepad.buttons[14].pressed) this.bindInput.left = true;
            if (gamepad.buttons[15].pressed) this.bindInput.right = true;

            if (gamepad.buttons[1].pressed) this.bindInput.bomb = true;
            if (gamepad.buttons[2].pressed) this.bindInput.punch = true;
            if (gamepad.buttons[3].pressed) this.bindInput.kick = true;
            if (gamepad.buttons[0].pressed) this.bindInput.detonate = true;
        }

        if (this.input.keyState["ArrowUp"]) this.bindInput.up = true;
        if (this.input.keyState["ArrowDown"]) this.bindInput.down = true;
        if (this.input.keyState["ArrowLeft"]) this.bindInput.left = true;
        if (this.input.keyState["ArrowRight"]) this.bindInput.right = true;

        if (this.input.keyState[" "]) this.bindInput.bomb = true;
        if (this.input.keyState["c"]) this.bindInput.punch = true;
        if (this.input.keyState["v"]) this.bindInput.kick = true;
        if (this.input.keyState["b"]) this.bindInput.detonate = true;

        const dx = this.input.stickStateX;
        const dy = this.input.stickStateY;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d > 0.5) {
            let at = Math.atan2(dy, dx);
            at += 0.3926991;
            if (at >= 0 && at <= Math.PI / 4) {
                this.bindInput.right = true;
            } else if (at >= Math.PI / 4 && at <= Math.PI / 2) {
                this.bindInput.right = true;
                this.bindInput.down = true;
            } else if (at >= Math.PI / 2 && at <= 3 * Math.PI / 4) {
                this.bindInput.down = true;
            } else if (at >= 3 * Math.PI / 4 && at <= Math.PI) {
                this.bindInput.down = true;
                this.bindInput.left = true;
            } else if (at <= 0 && at >= -Math.PI / 4) {
                this.bindInput.up = true;
                this.bindInput.right = true;
            } else if (at <= -Math.PI / 4 && at >= -Math.PI / 2) {
                this.bindInput.up = true;
            } else if (at <= -Math.PI / 2 && at >= 3 * -Math.PI / 4) {
                this.bindInput.up = true;
                this.bindInput.left = true;
            } else if (at <= -3 * Math.PI / 4 || at >= 3 * Math.PI / 4) {
                this.bindInput.left = true;
            }
        }

        if (this.input.buttonState) this.bindInput.bomb = true;
    }

    update() {
        return this.game.update();
    }

    render() {
        if (!this.pixel || !this.bomberTexture) { return; }        

        this.output.begin();

        this.aniCounter1++;
        if (this.aniCounter1 > 8) {
            this.aniCounter1 = 0;
            this.aniToggle1 = !this.aniToggle1;
        }

        let offsetX = 210;
        let offsetY = -10;

        let sheet = this.bomberTexture;
        let entity = this.entity;

        let sx = 0;
        let sy = 0;
        let ex = 34;
        let ey = 34;

        let spriteIndex = 0;

        // render the tile map
        for (let row = sy; row <= ey; ++row)
        {
            for (let col = sx; col <= ex; ++col)
            { 
                let tile = this.game.getTile(col, row);
                let sprite = this.output.next();
                sprite.x = col * 16 + offsetX;
                sprite.y = row * 16 + offsetY;
                let frame = 0;

                if (tile == TileType.Clear) {
                    // check to see if we need to render a shadow
                    if (row > 0) {
                        let uf = this.game.getTile(col, row-1);
                        if ( uf == TileType.Wall || uf == TileType.BreakableWall ) {
                            frame = 1;                          
                        }
                    }
                } else if (tile >= TileType.PowerBomb && tile <= TileType.PowerClick) {
                    // make all powerups blink
                    frame = 0;
                    if (this.aniToggle1 == true) {
                        frame = 1;
                    }
                }
                sprite.texture = sheet.textures[ tileAnimations[tile][frame] ];
            }
        }         
    
        let keyX = 32;

        if (this.bindInput.up) this.output.text(keyX+=8, 96, "U");
        if (this.bindInput.down) this.output.text(keyX+=8, 96, "D");
        if (this.bindInput.left) this.output.text(keyX+=8, 96, "L");
        if (this.bindInput.right) this.output.text(keyX+=8, 96, "R");

        if (this.bindInput.bomb) this.output.text(keyX+=8, 96, "S");
        if (this.bindInput.punch) this.output.text(keyX+=8, 96, "C");
        if (this.bindInput.kick) this.output.text(keyX+=8, 96, "V");
        if (this.bindInput.detonate) this.output.text(keyX+=8, 96, "B");

        let winner = this.game.winner();
        if (winner != 0) {
            let winner = this.game.winner();
            this.output.text(32, 64, Math.floor((this.game.winTicker() / 60) + 1).toString());
        }
        switch (winner) {
            case 1: 
                this.output.text(16, 32, "White Team Wins!");
                break;
            case 2: 
                this.output.text(16, 32, "Blue Team Wins!");
                break;
            case 3: 
                this.output.text(16, 32, "Red Team Wins!");
                break;
            case 4: 
                this.output.text(16, 32, "Black Team Wins!");
                break;
            case 5: 
                this.output.text(16, 32, "Draw!");
                break;
            default:
                break;
        }

        entity.begin(this.game);
        while ( entity.next() ) {

            if (entity.type == ObjType.Player) {
                // walk 
                // 0-6
                // 0-5
                // 0-6
                // 0-4
                if (entity.dead == 0) {
                    let sprite = this.output.next();

                    sprite.x = entity.position_x + offsetX;
                    sprite.y = entity.position_y + offsetY - 8;

                    //console.log( "team: " + entity.team + ", face: " + entity.face + ", ticker: " + Math.floor(entity.ticker / 2) );
                    let id = playerAnimations[entity.team][entity.face][Math.floor(entity.ticker / 2)];
                    sprite.texture = sheet.textures[id];
        
                    // @todo: draw local slot differently!
                    //if (handle == localHandle || entity.team != localTeam) {
                        // draw normal
                    //} else {
                        // draw darker (128)
                    //}
                }
            } else if (entity.type == ObjType.Corpse) {
                // die: 0-9 (jump), 0-2, 0, 0, 0-4, 0-10, then blink .5, .5, .5, .5, 0-2, 0, 0 ,0 , (end blink) 0-15 (still)
                let tick = 115 - entity.ticker;
                let jump = 0;
                let frame = 0;
                if (tick >= 0 && tick <= 19) {
                    frame = 0;
                    jump = Math.sin(tick * (3.14159 / 19)) * 20;
                } else if (tick >= 20 && tick <= 25) {
                    frame = 1;
                } else if (tick >= 26 && tick <= 26) {
                    frame = 2;
                } else if (tick >= 27 && tick <= 27) {
                    frame = 3;
                } else if (tick >= 28 && tick <= 36) {
                    frame = 4;
                } else if (tick >= 37 && tick <= 57) {
                    frame = 5;
                } else {
                    frame = 6;
                }

                let sprite = this.output.next();

                sprite.x = entity.position_x + offsetX;
                sprite.y = entity.position_y + offsetY - (8 + jump);
                let id = playerAnimations[entity.team][8][frame];
                sprite.texture = sheet.textures[id];
                
            } else if (entity.type == ObjType.Bomb) {
                // 1, 2, 2, 1, 1, 0, 0, 1, 1, 2, 2, 1, 1, 0, 0
                let frame = Math.floor(entity.ticker / 8);

                let sprite = this.output.next();

                sprite.x = entity.position_x + offsetX;
                sprite.y = entity.position_y + offsetY;
                let id = tileAnimations[15][frame];
                sprite.texture = sheet.textures[id];
                
                // make it the clicker later!
            } else if (entity.type == ObjType.Boom) {
                
                let frame = Math.floor(entity.ticker / 2);

                let sprite = this.output.next();

                sprite.x = entity.position_x + offsetX;
                sprite.y = entity.position_y + offsetY;
                let id = boomAnimations[entity.face][frame];
                sprite.texture = sheet.textures[id];
                
            } else if (entity.type == ObjType.ExplodedWall) {      
                /*
                    0 - 5   6
                    0 - 4   5
                    0 - 3   4
                    0 - 2   3
                    0 - 1   2
                    0       1
                */      

                let frame = Math.floor(entity.ticker / 8);
 
                let sprite = this.output.next();

                sprite.x = entity.position_x + offsetX;
                sprite.y = entity.position_y + offsetY;
                let id = tileAnimations[14][frame];
                sprite.texture = sheet.textures[id];
                
            } else if (entity.type == ObjType.ExplodedPower) {      
                /*
                    0 - 5   6
                    0 - 4   6
                    0 - 3   4
                    0 - 2   3
                    0 - 1   2
                    0       1
                    0       1
                */      
                let frame = Math.floor(entity.ticker / 8);

                let sprite = this.output.next();

                sprite.x = entity.position_x + offsetX;
                sprite.y = entity.position_y + offsetY;
                let id = tileAnimations[10][frame];
                sprite.texture = sheet.textures[id];
                
            }

        }
        

        this.output.end();
    }



}