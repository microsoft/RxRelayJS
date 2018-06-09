/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Operator } from 'rxjs/Operator';
import { rxSubscriber } from 'rxjs/symbol/rxSubscriber';
import { Subscriber } from 'rxjs/Subscriber';
import { Subscription } from 'rxjs/Subscription';
import { Observer } from 'rxjs/Observer';
import { Observable } from 'rxjs/Observable';
import { RelaySubscription } from './RelaySubscription';

/**
 * Emits all subsequent events to observers once they have subscribed.
 * @class RelaySubscriber<T>
 */
class RelaySubscriber<T> extends Subscriber<T> {
  constructor(protected destination: Relay<T>) {
    super(destination);
  }
}

/**
 * @class Relay<T>
 */
class Relay<T> extends Observable<T> {

  [rxSubscriber]() {
    return new RelaySubscriber(this);
  }

  observers: Observer<T | undefined>[] = [];

  constructor() {
    super();
  }

  static create: Function = <T>(destination: Observer<T>, source: Observable<T>): AnonymousRelay<T> => {
    return new AnonymousRelay<T>(destination, source);
  }

  lift<R>(operator: Operator<T, R>): Observable<R> {
    const relay = new AnonymousRelay(this, this);
    relay.operator = <any>operator;
    return <any>relay;
  }

  next(value?: T) {
    const { observers } = this;
    const len = observers.length;
    const copy = observers.slice();
    for (let i = 0; i < len; i++) {
      copy[i].next(value);
    }
  }

  error(err: any) {
    // Ignore
  }

  complete() {
    // Ignore
  }

  _subscribe(subscriber: Subscriber<T>): Subscription {
    this.observers.push(subscriber);
    return new RelaySubscription(this, subscriber);
  }

  asObservable(): Observable<T> {
    const observable = new Observable<T>();
    (<any>observable).source = this;
    return observable;
  }
}

/**
 * @class AnonymousRelay<T>
 */
class AnonymousRelay<T> extends Relay<T> {
  constructor(protected destination: { next(val: T): void }, source: Observable<T>) {
    super();
    this.source = source;
  }

  next(value: T) {
    const { destination } = this;
    if (destination && destination.next) {
      destination.next(value);
    }
  }

  _subscribe(subscriber: Subscriber<T>): Subscription {
    const { source } = this;
    if (source) {
      return this.source.subscribe(subscriber);
    } else {
      return Subscription.EMPTY;
    }
  }
}

export { Relay, AnonymousRelay };
