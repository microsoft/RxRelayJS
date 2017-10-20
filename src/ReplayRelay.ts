/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Relay } from './Relay';
import { IScheduler } from './Scheduler';
import { RelaySubscription } from './RelaySubscription';
import { Subscriber, Subscription, Scheduler } from 'rxjs';
import { ObserveOnSubscriber } from './ObserveOnSubscriber';

/**
 * Emits all previously observed and subsequent events to observers once they have subscribed.
 * @class ReplayRelay<T>
 */
export class ReplayRelay<T> extends Relay<T> {
  private _events: ReplayEvent<T>[] = [];
  private _bufferSize: number;
  private _windowTime: number;

  constructor(bufferSize: number = Number.POSITIVE_INFINITY,
              windowTime: number = Number.POSITIVE_INFINITY,
              private scheduler?: IScheduler) {
    super();
    this._bufferSize = bufferSize < 1 ? 1 : bufferSize;
    this._windowTime = windowTime < 1 ? 1 : windowTime;
  }

  next(value: T): void {
    const now = this._getNow();
    this._events.push(new ReplayEvent(now, value));
    this._trimBufferThenGetEvents();
    super.next(value);
  }

  protected _subscribe(subscriber: Subscriber<T>): Subscription {
    const _events = this._trimBufferThenGetEvents();
    const scheduler = this.scheduler;
    let subscription: Subscription;

    this.observers.push(subscriber);
    subscription = new RelaySubscription(this, subscriber);

    if (scheduler) {
      subscriber.add(subscriber = new ObserveOnSubscriber<T>(subscriber, scheduler));
    }

    const len = _events.length;
    for (let i = 0; i < len && !subscriber.closed; i++) {
      subscriber.next(_events[i].value);
    }

    return subscription;
  }

  _getNow(): number {
    return (this.scheduler || Scheduler.queue).now();
  }

  private _trimBufferThenGetEvents(): ReplayEvent<T>[] {
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

class ReplayEvent<T> {
  constructor(public time: number, public value: T) {
  }
}
