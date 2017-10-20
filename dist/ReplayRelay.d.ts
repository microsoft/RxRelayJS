/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Relay } from './Relay';
import { IScheduler } from './Scheduler';
import { Subscriber, Subscription } from 'rxjs';
/**
 * Emits all previously observed and subsequent events to observers once they have subscribed.
 * @class ReplayRelay<T>
 */
export declare class ReplayRelay<T> extends Relay<T> {
    private scheduler;
    private _events;
    private _bufferSize;
    private _windowTime;
    constructor(bufferSize?: number, windowTime?: number, scheduler?: IScheduler | undefined);
    next(value: T): void;
    protected _subscribe(subscriber: Subscriber<T>): Subscription;
    _getNow(): number;
    private _trimBufferThenGetEvents();
}
