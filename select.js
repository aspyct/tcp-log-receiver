var LocalEvent = require('./localevent.js');

class Select {
    constructor(node) {
        this._node = node;
        this._options = [];

        this._node.onchange = (e) => {
            this._onChange(e);
        };
        this.onSelect = new LocalEvent();
    }

    add(option, title) {
        var optionNode = document.createElement('option');
        optionNode.innerText = title || option.toString();

        optionNode.value = this._options.length;
        this._options.push(option);

        this._node.appendChild(optionNode);
    }

    _onChange(e) {
        var option = this._options[this._node.value];
        this.onSelect.trigger(option, this);
    }
}

module.exports = Select;
