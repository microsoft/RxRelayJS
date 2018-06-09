/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Operator } from 'rxjs/Operator';
import { Subscriber } from 'rxjs/Subscriber';
import { Subscription } from 'rxjs/Subscription';
import { Observer } from 'rxjs/Observer';
import { Observable } from 'rxjs/Observable';
/**
 * @class Relay<T>
 */
declare class Relay<T> extends Observable<T> {
    observers: Observer<T | undefined>[];
    constructor();
    static create: Function;
    lift<R>(operator: Operator<T, R>): Observable<R>;
    next(value?: T): void;
    error(err: any): void;
    complete(): void;
    _subscribe(subscriber: Subscriber<T>): Subscription;
    asObservable(): Observable<T>;
}
/**
 * @class AnonymousRelay<T>
 */
declare class AnonymousRelay<T> extends Relay<T> {
    protected destination: {
        next(val: T): void;
    };
    constructor(destination: {
        next(val: T): void;
    }, source: Observable<T>);
    next(value: T): void;
    _subscribe(subscriber: Subscriber<T>): Subscription;
}
export { Relay, AnonymousRelay };
