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
        this._hasValue = false;
        if (typeof _value !== 'undefined') {
            this._hasValue = true;
        }
    }
    get value() {
        return this.getValue();
    }
    _subscribe(subscriber) {
        const subscription = super._subscribe(subscriber);
        if (subscription && !subscription.closed && this.hasValue()) {
            subscriber.next(this._value);
        }
        return subscription;
    }
    getValue() {
        return this._value;
    }
    hasValue() {
        return this._hasValue;
    }
    next(value) {
        this._value = value;
        if (!this.hasValue()) {
            this._hasValue = true;
        }
        super.next(this._value);
    }
}
exports.BehaviorRelay = BehaviorRelay;
//# sourceMappingURL=BehaviorRelay.js.map