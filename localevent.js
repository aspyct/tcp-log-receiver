class LocalEvent {
    constructor() {
        this._listeners = new Map();
        this._nextKey = 0;
    }

    listen(listener) {
        var key = this._nextKey++;
        this._listeners.set(key, listener);

        return new ListenerHandle(this, key);
    }

    _unregister(key) {
        this._listeners.delete(key);
    }

    trigger() {
        var eventArgs = arguments;

        this._listeners.forEach((listener) => {
            listener.apply(listener, eventArgs);
        });
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
