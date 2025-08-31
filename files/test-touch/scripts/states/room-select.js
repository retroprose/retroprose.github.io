class SelectRoom {

    constructor(input, output, result) {
        this.input = input;
        this.output = output;
        this.result = result;
        this.next = undefined;
        this.selected = 0;
        
        this.keyDown = this.keyDown.bind(this);
        window.addEventListener('keydown', this.keyDown);

    }

    dispose() {
        window.removeEventListener('keydown', this.keyDown);
    }

    keyDown(event) {
        if (event.key === 'ArrowUp') {
            if (this.selected > 0) {
                this.selected--;
            } else {
                this.selected = 10;
            }
        } else if (event.key === 'ArrowDown') {
            if (this.selected < 10) {
                this.selected++;
            } else {
                this.selected = 0;
            }
        } else if (event.key === 'Enter') {
            if (this.selected < 10) {
                this.next = "ConnectedState";
                this.result = this.selected.toString();
            } else if (this.selected == 10) {
                this.next = "OfflineState";
                this.result = '10';
            } else {
                this.next = "EditorState";
                this.result = '11';
            }
        }
    }

    update(delta) {
        let xOffset = 276;
        let yOffset = 132;

        this.output.reset();
        this.output.text(xOffset, yOffset, "Use arrow keys to select and enter to accept choice");
        let y = 32;
        for (let i = 0; i < 10; ++i) {
            this.output.text(19 * 8 + xOffset, y + yOffset, "Enter Room " + i.toString());
            y += 24;
        }
        this.output.text(19 * 8 + xOffset, y + yOffset, "Play Offlne");
        y += 24;
        //this.output.text(19 * 8 + xOffset, y + yOffset, "Experimental");
        
        // shows selection
        y = this.selected * 24 + 32;
        this.output.text(19 * 8 - 32 + xOffset, y + yOffset, ">>>");
        this.output.text(32 * 8 + xOffset, y + yOffset, "<<<");        

        this.output.complete();

        console.log(this.output.canvas.getBoundingClientRect());

    }

}