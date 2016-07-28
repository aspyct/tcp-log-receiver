class LocalEvent {
    constructor() {
        this.listeners = [];
    }

    listen(listener) {
        var key = this.listeners.length;
        this.listeners.push(listener);

        return new ListenerHandle(this, key);
    }

    _unregister(key) {
        delete this.listeners[key];
    }

    trigger() {
        for (var i = 0; i < this.listeners.length; ++i) {
            var listener = this.listeners[i];
            if (listener != undefined) {
                listener.apply(listener, arguments);
            }
        }
    }

    static get NullListener() {
        return new NullListener();
    }
}

class NullListener {
    unregister() {}
}

class ListenerHandle {
    constructor(target, key) {
        this._target = target;
        this._key = key;
    }

    unregister() {
        this._target._unregister(this._key);
    }
}

module.exports = LocalEvent;
