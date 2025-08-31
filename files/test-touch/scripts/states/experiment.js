
class ExperimentState {
    constructor(input, output, result) {
        this.cpp = new Module.Binder();
        let cpp = this.cpp;
        window.cmd = {
            action: function() {
                cpp.action();
            }
        };
    }

    dispose() {
        delete window.cmd;
        this.cpp.delete();
    }

    update() {

    }
}
