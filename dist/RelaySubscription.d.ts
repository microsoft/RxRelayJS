/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Observer, Subscription } from 'rxjs';
import { Relay } from './Relay';
/**
 * Subscription subclass with the ability to remove itself
 * from a Relay's internal list of observers when unsubscribe is called.
 * @class ReplaySubscription<T>
 */
export declare class RelaySubscription<T> extends Subscription {
    subscriber: Observer<T>;
    closed: boolean;
    relay: Relay<T> | null;
    constructor(relay: Relay<T>, subscriber: Observer<T>);
    unsubscribe(): void;
}
