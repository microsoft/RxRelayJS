"use strict";
/**
 * Copyright (c) 2015-2017 Google, Inc., Netflix, Inc., Microsoft Corp. and contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See
 * the License for the specific language governing permissions and limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
class ObserveOnMessage {
    constructor(notification, destination) {
        this.notification = notification;
        this.destination = destination;
    }
}
exports.ObserveOnMessage = ObserveOnMessage;
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class ObserveOnSubscriber extends rxjs_1.Subscriber {
    constructor(destination, scheduler, delay = 0) {
        super(destination);
        this.scheduler = scheduler;
        this.delay = delay;
    }
    static dispatch(arg) {
        const { notification, destination } = arg;
        notification.observe(destination);
        this.unsubscribe();
    }
    scheduleMessage(notification) {
        this.add(this.scheduler.schedule(ObserveOnSubscriber.dispatch, this.delay, new ObserveOnMessage(notification, this.destination)));
    }
    _next(value) {
        this.scheduleMessage(rxjs_1.Notification.createNext(value));
    }
    _error(err) {
        this.scheduleMessage(rxjs_1.Notification.createError(err));
    }
    _complete() {
        this.scheduleMessage(rxjs_1.Notification.createComplete());
    }
}
exports.ObserveOnSubscriber = ObserveOnSubscriber;
//# sourceMappingURL=ObserveOnSubscriber.js.map