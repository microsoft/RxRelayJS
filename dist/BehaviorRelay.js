"use strict";
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Relay_1 = require("./Relay");
/**
 * Emits the most recent observed event and all subsequent events to observers once they have subscribed.
 * @class BehaviorRelay<T>
 */
class BehaviorRelay extends Relay_1.Relay {
    constructor(_value) {
        super();
        this._value = _value;
    }
    get value() {
        return this.getValue();
    }
    _subscribe(subscriber) {
        const subscription = super._subscribe(subscriber);
        if (subscription && !subscription.closed) {
            subscriber.next(this._value);
        }
        return subscription;
    }
    getValue() {
        return this._value;
    }
    next(value) {
        super.next(this._value = value);
    }
}
exports.BehaviorRelay = BehaviorRelay;
//# sourceMappingURL=BehaviorRelay.js.map