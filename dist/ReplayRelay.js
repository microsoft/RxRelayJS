"use strict";
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Relay_1 = require("./Relay");
const RelaySubscription_1 = require("./RelaySubscription");
const rxjs_1 = require("rxjs");
const ObserveOnSubscriber_1 = require("./ObserveOnSubscriber");
/**
 * Emits all previously observed and subsequent events to observers once they have subscribed.
 * @class ReplayRelay<T>
 */
class ReplayRelay extends Relay_1.Relay {
    constructor(bufferSize = Number.POSITIVE_INFINITY, windowTime = Number.POSITIVE_INFINITY, scheduler) {
        super();
        this.scheduler = scheduler;
        this._events = [];
        this._bufferSize = bufferSize < 1 ? 1 : bufferSize;
        this._windowTime = windowTime < 1 ? 1 : windowTime;
    }
    next(value) {
        const now = this._getNow();
        this._events.push(new ReplayEvent(now, value));
        this._trimBufferThenGetEvents();
        super.next(value);
    }
    _subscribe(subscriber) {
        const _events = this._trimBufferThenGetEvents();
        const scheduler = this.scheduler;
        let subscription;
        this.observers.push(subscriber);
        subscription = new RelaySubscription_1.RelaySubscription(this, subscriber);
        if (scheduler) {
            subscriber.add(subscriber = new ObserveOnSubscriber_1.ObserveOnSubscriber(subscriber, scheduler));
        }
        const len = _events.length;
        for (let i = 0; i < len && !subscriber.closed; i++) {
            subscriber.next(_events[i].value);
        }
        return subscription;
    }
    _getNow() {
        return (this.scheduler || rxjs_1.queueScheduler).now();
    }
    _trimBufferThenGetEvents() {
        const now = this._getNow();
        const _bufferSize = this._bufferSize;
        const _windowTime = this._windowTime;
        const _events = this._events;
        let eventsCount = _events.length;
        let spliceCount = 0;
        // Trim events that fall out of the time window.
        // Start at the front of the list. Break early once
        // we encounter an event that falls within the window.
        while (spliceCount < eventsCount) {
            if ((now - _events[spliceCount].time) < _windowTime) {
                break;
            }
            spliceCount++;
        }
        if (eventsCount > _bufferSize) {
            spliceCount = Math.max(spliceCount, eventsCount - _bufferSize);
        }
        if (spliceCount > 0) {
            _events.splice(0, spliceCount);
        }
        return _events;
    }
}
exports.ReplayRelay = ReplayRelay;
class ReplayEvent {
    constructor(time, value) {
        this.time = time;
        this.value = value;
    }
}
//# sourceMappingURL=ReplayRelay.js.map