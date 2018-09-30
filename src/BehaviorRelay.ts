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
export class BehaviorRelay<T> extends Relay<T> {

  constructor(private _value: T) {
    super();
  }

  get value(): T {
    return this.getValue();
  }

  _subscribe(subscriber: Subscriber<T>): Subscription {
    const subscription = super._subscribe(subscriber);
    if (subscription && !subscription.closed) {
      subscriber.next(this._value);
    }
    return subscription;
  }

  getValue(): T {
    return this._value;
  }

  next(value: T): void {
    super.next(this._value = value);
  }
}
