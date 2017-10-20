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
export class RelaySubscription<T> extends Subscription {
  closed: boolean = false;

  relay: Relay<T> | null;

  constructor(relay: Relay<T>, public subscriber: Observer<T>) {
    super();
    this.relay = relay;
  }

  unsubscribe() {
    if (this.closed) {
      return;
    }

    this.closed = true;

    const relay = this.relay!;
    const observers = relay.observers;

    this.relay = null;

    if (!observers || observers.length === 0) {
      return;
    }

    const subscriberIndex = observers.indexOf(this.subscriber);

    if (subscriberIndex !== -1) {
      observers.splice(subscriberIndex, 1);
    }
  }
}
