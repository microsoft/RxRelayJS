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

import { Subscriber } from 'rxjs/Subscriber';
import { Notification } from 'rxjs/Notification';
import { Action } from './Action';
import { IScheduler } from './Scheduler';
import { PartialObserver } from './Observer';

export class ObserveOnMessage {
  constructor(public notification: Notification<any>,
              public destination: PartialObserver<any>) {
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
export class ObserveOnSubscriber<T> extends Subscriber<T> {
  static dispatch(this: Action<ObserveOnMessage>, arg: ObserveOnMessage) {
    const { notification, destination } = arg;
    notification.observe(destination);
    this.unsubscribe();
  }

  constructor(destination: Subscriber<T>,
              private scheduler: IScheduler,
              private delay: number = 0) {
    super(destination);
  }

  private scheduleMessage(notification: Notification<any>): void {
    this.add(this.scheduler.schedule(
      ObserveOnSubscriber.dispatch,
      this.delay,
      new ObserveOnMessage(notification, this.destination)
    ));
  }

  protected _next(value: T): void {
    this.scheduleMessage(Notification.createNext(value));
  }

  protected _error(err: any): void {
    this.scheduleMessage(Notification.createError(err));
  }

  protected _complete(): void {
    this.scheduleMessage(Notification.createComplete());
  }
}
