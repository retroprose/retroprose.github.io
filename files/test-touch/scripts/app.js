class App {

    async init() {
        // await this so that we know the module is already loaded!
        await (() => {
            return new Promise(resolve => {
                Module.onRuntimeInitialized = function() {
                    resolve();
                };
            });    
        })();

        // create screen
        this.output = new Screen();
        await this.output.init();

        // create key map
        this.input = { };
        this.input._gamepads = { };

        // bind functions to this
        this.keyPress = this.keyPress.bind(this);
        this.updateLoop = this.updateLoop.bind(this);

        // add keypress listeners
        window.addEventListener('keyup', this.keyPress);
        window.addEventListener('keydown', this.keyPress);
     
        window.addEventListener("gamepadconnected", (e) => {
            console.log(
                "Gamepad connected at index %d: %s. %d buttons, %d axes.",
                e.gamepad.index,
                e.gamepad.id,
                e.gamepad.buttons.length,
                e.gamepad.axes.length,
            );
            this.input._gamepads[e.gamepad.index] = e.gamepad;
        });

        window.addEventListener("gamepaddisconnected", (e) => {
            console.log(
                "Gamepad disconnected from index %d: %s",
                e.gamepad.index,
                e.gamepad.id,
            );
            delete this.input._gamepads[e.gamepad.index];
        });

        this.factory = {
            //'ExperimentState': ExperimentState,
            'SelectRoom': SelectRoom,
            'OfflineState': OfflineState,
            'ConnectedState': ConnectedState,
            //'EditorState': EditorState
        };

        // current state
        this.state = new this.factory['SelectRoom'](this.input, this.output);
        //this.state = new this.factory['ExperimentState'](this.input, this.output);

        // get the update loop started!
        requestAnimationFrame(this.updateLoop);
    }

    updateLoop(delta) {
        if (this.input['`']) {
            this.output.fullScreen();
        }
        this.update(delta);
        requestAnimationFrame(this.updateLoop);
    }

    keyPress(event) {
        this.input[event.key] = (event.type == 'keydown') ? true : false;
    }

    update(delta) {
        this.state.update(delta);
        if (this.state.next) {
            let next = this.state.next;
            let result = this.state.result;
            this.state.dispose();
            this.state = new this.factory[next](this.input, this.output, result);
        }
    }

}