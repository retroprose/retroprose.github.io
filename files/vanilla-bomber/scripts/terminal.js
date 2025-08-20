class Terminal extends HTMLElement {

    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: "open" });
        this.shadow.innerHTML = `
            <style>
                :host {
                    display: block;
                    background-color: lightgray;
                    color: black;
                    font-family: 'Courier New', monospace;
                    overflow-y: scroll;

                    width: 960px;
				    height: 270px;
                }

                * {
                    font-family: 'Courier New', monospace;
                }

                #output-area {
                    white-space: pre-wrap;
                }

                #input-line {
                    display: flex;
                }

                #prompt {
                    color: black;
                }

                #command-input {
                    flex-grow: 1;
                    background-color: transparent;
                    border: none;
                    color: black;
                    outline: none;
                }
            </style>
            <div id="output-area"></div>
            <div id="input-line">
                <span id="prompt">command: </span>
                <input type="text" id="command-input" autocomplete="off">
            </div>
        `;

        this.commandInput = this.shadow.querySelector('#command-input');
        this.outputArea = this.shadow.querySelector('#output-area');
        this.keyDown = this.keyDown.bind(this);
        this.commandEvent = this.commandEvent.bind(this);

        this.data = {
            buffer: [],
            clear: function () {
                this.buffer = [];
            },
            append: function (text) {
                this.buffer.push(`<p>${text}</p>`);
            },
            command: function (cmd) {
                this.commands = { ...this.commands, ...cmd };
            },
            commands: {
                'help': {
                    fn: function(co, pr) {
                        co.append('Available commands: help, echo [text], clear');
                    }
                },
                'clear': {
                    fn: function(co, pr) {
                        co.clear();
                    }
                },
                'echo': {
                    pr: {
                        text: 'string'
                    },
                    fn: function(co, pr) {
                        co.append(pr.text);
                    }
                }
            }
        };
    }

    // runs when the element is added to the page
    connectedCallback() {
        this.addEventListener('keydown', this.keyDown);
        this.commandInput.addEventListener('keydown', this.commandEvent);
    }

    // runs when the element is removed from the page
    disconnectedCallback() {
        this.removeEventListener('keydown', this.keyDown);
        this.commandInput.removeEventListener('keydown', this.commandEvent);
    }

    keyDown(event) {
        if (document.activeElement != this.commandInput) {
            this.scrollTop = this.scrollHeight; // Scroll to bottom
            this.commandInput.focus();
            //this.commandInput.dispatchEvent(event);
        }
    }

    commandEvent(event) {
        if (event.key === 'Enter') {
            const input = this.commandInput.value.split(/(\s+)/).filter( e => e.trim().length > 0);
            if (input.length > 0) {
                this.data.append(`<span>command: </span>${this.commandInput.value}`);
                const command = input[0].toLowerCase();
                const params = input.slice(1);
                const entry = this.data.commands[command];

                try {
                    let pack = {};
                    if (entry == undefined) {   
                        throw new Error('unrecognized command');
                    }
                    if (entry.pr !== undefined) {   
                        let pindex = 0;
                        for (const key in entry.pr) {
                            if (params.length <= pindex) {
                                throw new Error('too few parameters');
                            }
                            const param = params[pindex];
                            let value = null;
                            switch (entry.pr[key]) {
                                case 'number':
                                    value = parseInt(param);
                                    if (isNaN(value)) {
                                        throw new Error(`${param} is not a number`);
                                    }
                                    break;

                                case 'float':
                                    value = parseFloat(param);
                                    if (isNaN(value)) {
                                        throw new Error(`${param} is not a float`);
                                    }    
                                    break;
                    
                                case 'boolean':
                                    value = Boolean(param);  
                                    break;
                                
                                default:
                                    // don't do anything (strings go here too)
                                    break;
                            }
                            pack[key] = param;
                            ++pindex;
                        }
                    } else {
                        pack = params;
                    }
                    entry.fn(this.data, pack);
                } catch (error) {
                    this.data.append(error.toString());
                }

                this.outputArea.innerHTML = this.data.buffer.join('');
                this.commandInput.value = '';
                this.scrollTop = this.scrollHeight; // Scroll to bottom
            }
        }

    }

}

//customElements.define('retro-terminal', Terminal);


(function( cmd, undefined ) {

    cmd.echo = function(text) {
        console.log('you echoed: ' + text);
    };

}( window.cmd = window.cmd || {} ));