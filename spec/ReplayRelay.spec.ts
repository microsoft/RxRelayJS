/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Relay, ReplayRelay } from '../dist/RxRelay';
import { Observable, Observer, TestScheduler } from 'rxjs';

let rxTestScheduler: TestScheduler;
let hot;
let expectObservable;

beforeAll(() => {
  rxTestScheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
  hot = (marbles: string, values?: any, error?: any) => rxTestScheduler.createHotObservable(marbles, values, error);
  expectObservable = (observable: Observable<any>, unsubscriptionMarbles: string = null) => 
    rxTestScheduler.expectObservable(observable, unsubscriptionMarbles);
});

describe('ReplayRelay', () => {
  it('should extend Relay', () => {
    const relay = new ReplayRelay();
    expect(relay).toMatchObject(new Relay());
  });

  it('should add the observer before running subscription code', () => {
    const relay = new ReplayRelay<number>();
    relay.next(1);
    const results = [];

    relay.subscribe((value) => {
      results.push(value);
      if (value < 3) {
        relay.next(value + 1);
      }
    });

    expect(results).toEqual([1, 2, 3]);
  });

  it('should replay values upon subscription', () => {
    const relay = new ReplayRelay();
    const expected = [1, 2, 3];

    relay.next(1);
    relay.next(2);
    relay.next(3);
    relay.subscribe((x: number) => {
      expect(x).toBe(expected.shift());
    });

    expect(expected).toEqual([]);
  });

  it('should replay values, but not errors', () => {
    const relay = new ReplayRelay();
    const expected = [1, 2, 3];

    relay.next(1);
    relay.next(2);
    relay.next(3);
    relay.error('fooey');

    relay.subscribe((x: number) => {
      expect(x).toBe(expected.shift());
    }, 
    err => fail(),
    () => fail());

    expect(expected).toEqual([]);
  });

  it('should replay values, even after complete', () => {
    const relay = new ReplayRelay();
    const expected = [1, 2, 3, 4];

    relay.next(1);
    relay.next(2);
    relay.next(3);
    relay.complete();
    relay.next(4);

    relay.subscribe((x: number) => {
      expect(x).toBe(expected.shift());
    },
    err => fail(),
    () => fail());

    expect(expected).toEqual([]);
  });

  describe('with bufferSize=2', () => {
    it('should replay 2 previous values when subscribed', () => {
      const relay = new ReplayRelay(2);
      const expected = [2, 3];
  
      let i = 0;
      relay.next(1);
      relay.next(2);
      relay.next(3);
      relay.subscribe((x: number) => {
        expect(x).toBe(expected[i++]);
      });
  
      expect(i).toBe(2);
    });

    it('should handle subscribers that arrive and leave at different times', () => {
      const relay = new ReplayRelay(2);
      const results1 = [];
      const results2 = [];
      const results3 = [];

      relay.next(1);
      relay.next(2);
      relay.next(3);
      relay.next(4);

      const subscription1 = relay.subscribe(
        (x: number) => { results1.push(x); },
        (err: any) => { results1.push('E'); },
        () => { results1.push('C'); }
      );

      relay.next(5);

      const subscription2 = relay.subscribe(
        (x: number) => { results2.push(x); },
        (err: any) => { results2.push('E'); },
        () => { results2.push('C'); }
      );

      relay.next(6);
      relay.next(7);

      subscription1.unsubscribe();

      relay.next(8);

      subscription2.unsubscribe();

      relay.next(9);
      relay.next(10);

      const subscription3 = relay.subscribe(
        (x: number) => { results3.push(x); },
        (err: any) => { results3.push('E'); },
        () => { results3.push('C'); }
      );

      relay.next(11);

      subscription3.unsubscribe();

      expect(results1).toEqual([3, 4, 5, 6, 7]);
      expect(results2).toEqual([4, 5, 6, 7, 8]);
      expect(results3).toEqual([9, 10, 11]);
    });
  });

  describe('with windowTime=40', () => {
    it('should replay previous values since 40 time units ago when subscribed', () => {
      const relay = new ReplayRelay(Number.POSITIVE_INFINITY, 40, rxTestScheduler);

      function feedNextIntoRelay(x) { relay.next(x); }
      function feedErrorIntoRelay(err) { relay.error(err); }
      function feedCompleteIntoRelay() { relay.complete(); }

      const sourceTemplate =  '-1-2-3----4------5-6----7-8----9--|';
      const subscriber1 = hot('      (a|)                         ').mergeMapTo(relay);
      const unsub1 =          '                     !             ';
      const expected1   =     '      (23)4------5-6--             ';
      const subscriber2 = hot('            (b|)                   ').mergeMapTo(relay);
      const unsub2 =          '                         !         ';
      const expected2   =     '            4----5-6----7-         ';
      const subscriber3 = hot('                           (c|)    ').mergeMapTo(relay);
      const expected3   =     '                           (78)9--|';

      expectObservable(hot(sourceTemplate).do(
        feedNextIntoRelay, feedErrorIntoRelay, feedCompleteIntoRelay
      )).toBe(sourceTemplate);
      expectObservable(subscriber1, unsub1).toBe(expected1);
      expectObservable(subscriber2, unsub2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
    });

    it('should replay last values since 40 time units ago when subscribed', () => {
      const replayRelay = new ReplayRelay(Number.POSITIVE_INFINITY, 40, rxTestScheduler);
      function feedNextIntoRelay(x) { replayRelay.next(x); }
      function feedErrorIntoRelay(err) { replayRelay.error(err); }
      function feedCompleteIntoRelay() { replayRelay.complete(); }

      const sourceTemplate =  '-1-2-3----4|';
      const subscriber1 = hot('             (a|)').mergeMapTo(replayRelay);
      const expected1   =     '             (4|)';

      expectObservable(hot(sourceTemplate).do(
        feedNextIntoRelay, feedErrorIntoRelay, feedCompleteIntoRelay
      )).toBe(sourceTemplate);
      expectObservable(subscriber1).toBe(expected1);
    });
  });

  it('should be an Observer which can be given to Observable.subscribe (with error)', () => {
    const source = Observable.create((observer: Observer<any>) => {
      observer.next(1);
      observer.next(2);
      observer.next(3);
      observer.next(4);
      observer.next(5);
      observer.error(new Error());
    });

    const relay = new ReplayRelay();
    const expected = [1, 2, 3, 4, 5];

    relay.error = jest.fn();

    relay.subscribe(
      x => expect(x).toBe(expected.shift()));

    source.subscribe(relay);
    expect(expected).toEqual([]);
    expect(relay.error).toBeCalled();
  });

  it('should be an Observer which can be given to Observable.subscribe (without error)', () => {
    const source = Observable.of(1, 2, 3, 4, 5);

    const relay = new ReplayRelay();
    const expected = [1, 2, 3, 4, 5];

    relay.complete = jest.fn();

    relay.subscribe(
      x => expect(x).toBe(expected.shift()));

    source.subscribe(relay);
    expect(expected).toEqual([]);
    expect(relay.complete).toBeCalled();
  });
});
