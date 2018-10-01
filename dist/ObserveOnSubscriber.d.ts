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
import { Notification, Subscriber } from 'rxjs';
import { Action } from './Action';
import { IScheduler } from './Scheduler';
import { PartialObserver } from './Observer';
export declare class ObserveOnMessage {
    notification: Notification<any>;
    destination: PartialObserver<any>;
    constructor(notification: Notification<any>, destination: PartialObserver<any>);
}
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
export declare class ObserveOnSubscriber<T> extends Subscriber<T> {
    private scheduler;
    private delay;
    static dispatch(this: Action<ObserveOnMessage>, arg: ObserveOnMessage): void;
    constructor(destination: Subscriber<T>, scheduler: IScheduler, delay?: number);
    private scheduleMessage;
    protected _next(value: T): void;
    protected _error(err: any): void;
    protected _complete(): void;
}
