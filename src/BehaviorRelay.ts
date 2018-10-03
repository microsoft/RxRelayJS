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
  private _hasValue = false;

  constructor(private _value?: T) {
    super();
    if (typeof _value !== 'undefined') {
      this._hasValue = true;
    }
  }

  get value(): T | void {
    return this.getValue();
  }

  _subscribe(subscriber: Subscriber<T>): Subscription {
    const subscription = super._subscribe(subscriber);
    if (subscription && !subscription.closed && this.hasValue()) {
      subscriber.next(this._value);
    }
    return subscription;
  }

  getValue(): T | void {
    return this._value;
  }

  hasValue(): boolean {
    return this._hasValue;
  }

  next(value: T): void {
    this._value = value;

    if (!this.hasValue()) {
      this._hasValue = true;
    }

    super.next(this._value);
  }
}
