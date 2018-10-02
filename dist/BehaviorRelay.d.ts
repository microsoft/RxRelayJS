/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Relay } from './Relay';
import { Subscriber, Subscription } from 'rxjs';
/**
 * Emits the most recent observed event and all subsequent events to observers once they have subscribed.
 * @class BehaviorRelay<T>
 */
export declare class BehaviorRelay<T> extends Relay<T> {
    private _value?;
    private _hasValue;
    constructor(_value?: T | undefined);
    readonly value: T | void;
    _subscribe(subscriber: Subscriber<T>): Subscription;
    getValue(): T | void;
    next(value: T): void;
}
