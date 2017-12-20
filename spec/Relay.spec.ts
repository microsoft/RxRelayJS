/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Relay, BehaviorRelay, AnonymousRelay } from '../dist/RxRelay';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { TestScheduler } from 'rxjs/testing/TestScheduler';
import { of } from 'rxjs/observable/of';
import { delay } from 'rxjs/operators/delay';

let rxTestScheduler: TestScheduler;
let hot;
let expectObservable;

beforeAll(() => {
  rxTestScheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
  hot = (marbles: string, values?: any, error?: any) => rxTestScheduler.createHotObservable(marbles, values, error);
  expectObservable = (observable: Observable<any>, unsubscriptionMarbles: string = null) => 
    rxTestScheduler.expectObservable(observable, unsubscriptionMarbles);
});

describe('Relay', () => {
  it('should pump values right on through itself', () => {
    const relay = new Relay();
    const expected = ['foo', 'bar'];

    relay.subscribe((x: string) => {
      expect(x).toBe(expected.shift());
    });

    relay.next('foo');
    relay.next('bar');
    
    expect(expected.length).toBe(0);
  });

  it('should pump values to multiple subscribers', () => {
    const relay = new Relay();
    const expected = ['foo', 'bar'];

    let i = 0;
    let j = 0;

    relay.subscribe(function (x) {
      expect(x).toBe(expected[i++]);
    });

    relay.subscribe(function (x) {
      expect(x).toBe(expected[j++]);
    });

    expect(relay.observers.length).toBe(2);
    
    relay.next('foo');
    relay.next('bar');
    
    expect(i).toBe(2);
    expect(j).toBe(2);
  });

  it('should ignore error and emit subsequent values', () => {
    const relay = new Relay();
    const expected = ['foo', 'bar'];

    relay.subscribe((x: string) => {
      expect(x).toBe(expected.shift());
    });

    relay.next('foo');
    relay.error(new Error('Should be ignored'));
    relay.next('bar');
    
    expect(expected.length).toBe(0);
  });

  it('should ignore complete and emit subsequent values', () => {
    const relay = new Relay();
    const expected = ['foo', 'bar'];

    relay.subscribe((x: string) => {
      expect(x).toBe(expected.shift());
    });

    relay.next('foo');
    relay.complete();
    relay.next('bar');
    
    expect(expected.length).toBe(0);
  });

  it('should handle subscribers that arrive and leave at different times', () => {
    const relay = new Relay();
    const results1 = [];
    const results2 = [];
    const results3 = [];

    relay.next(1);
    relay.next(2);
    relay.next(3);
    relay.next(4);

    const subscription1 = relay.subscribe(
      x => results1.push(x)
    );

    relay.next(5);

    const subscription2 = relay.subscribe(
      x => results2.push(x)
    );

    relay.next(6);
    relay.next(7);

    subscription1.unsubscribe();

    relay.next(8);

    subscription2.unsubscribe();

    relay.next(9);
    relay.next(10);

    const subscription3 = relay.subscribe(
      x => results3.push(x)
    );

    relay.next(11);

    subscription3.unsubscribe();

    expect(results1).toEqual([5, 6, 7]);
    expect(results2).toEqual([6, 7, 8]);
    expect(results3).toEqual([11]);
  });

  it('should clean out unsubscribed subscribers', () => {
    const relay = new Relay();

    const sub1 = relay.subscribe(x => {});
    const sub2 = relay.subscribe(x => {});

    expect(relay.observers.length).toBe(2);
    sub1.unsubscribe();
    expect(relay.observers.length).toBe(1);
    sub2.unsubscribe();
    expect(relay.observers.length).toBe(0);
  });

  it('should have a static create function that works', () => {
    expect(typeof Relay.create).toBe('function');
    
    const source = of(1, 2, 3, 4, 5);
    const nexts = [];
    const output = [];

    let error: any;
    let complete = false;

    const destination = {
      closed: false,
      next: x => nexts.push(x),
      error: function (err) {
        error = err;
        this.closed = true;
      },
      complete: () => {
        complete = true;
        this.closed = true;
      }
    };

    const relay = Relay.create(destination, source);

    relay.subscribe(x => output.push(x));

    relay.next('a');
    relay.next('b');
    relay.next('c');

    expect(nexts).toEqual(['a', 'b', 'c']);
    expect(complete).toBe(false);
    expect(error).toBe(undefined);

    expect(output).toEqual([1, 2, 3, 4, 5]);
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

    const relay = new Relay();
    const expected = [1, 2, 3, 4, 5];

    relay.error = jest.fn();

    relay.subscribe(
      x => expect(x).toBe(expected.shift()));

    source.subscribe(relay);
    expect(expected).toEqual([]);
    expect(relay.error).toBeCalled();
  });

  it('should be an Observer which can be given to Observable.subscribe (without error)', () => {
    const source = of(1, 2, 3, 4, 5);

    const relay = new Relay();
    const expected = [1, 2, 3, 4, 5];

    relay.complete = jest.fn();

    relay.subscribe(
      x => expect(x).toBe(expected.shift()));

    source.subscribe(relay);
    expect(expected).toEqual([]);
    expect(relay.complete).toBeCalled();
  });

  it('should be usable as an Observer of a finite delayed Observable', done => {
    const source = of(1, 2, 3).pipe(delay(50));
    const relay = new Relay();

    const expected = [1, 2, 3];

    relay.subscribe(
      x => expect(x).toBe(expected.shift()),
    );

    source.subscribe(relay);
    source.subscribe(
      x => {},
      err => {},
      () => {
        expect(expected).toEqual([]);
        done();
      });
  });

  describe('asObservable', () => {
    it('should hide relay', () => {
      const relay = new Relay();
      const observable = relay.asObservable();

      expect(relay).not.toEqual(observable);

      expect(observable instanceof Observable).toBe(true);
      expect(observable instanceof Relay).toBe(false);
    });

    it('should handle relay never emits', () => {
      const observable = hot('-').asObservable();

      expectObservable(observable).toBe(<any>[]);
    });

    it('should handle relay completes without emits', () => {
      const observable = hot('--^--|').asObservable();
      const expected =         '---|';

      expectObservable(observable).toBe(expected);
    });

    it('should handle relay throws', () => {
      const observable = hot('--^--#').asObservable();
      const expected =         '---#';

      expectObservable(observable).toBe(expected);
    });

    it('should handle relay emits', () => {
      const observable = hot('--^--x--|').asObservable();
      const expected =         '---x--|';

      expectObservable(observable).toBe(expected);
    });

    it('should work with inherited relay', () => {
      const results = [];
      const relay = new BehaviorRelay(0);

      relay.next(42);

      const observable = relay.asObservable();

      observable.subscribe(x => results.push(x), null, () => results.push('done'));

      expect(results).toEqual([42]);
    });
  });
});

describe('AnonymousRelay', () => {
  it('should be exposed', () => {
    expect(typeof AnonymousRelay).toBe('function');
  });

  it('should not eager', () => {
    let subscribed = false;

    const relay = Relay.create(null, new Observable((observer: Observer<any>) => {
      subscribed = true;
      const subscription = of('x').subscribe(observer);
      return () => {
        subscription.unsubscribe();
      };
    }));

    const observable = relay.asObservable();
    expect(subscribed).toBe(false);

    observable.subscribe();
    expect(subscribed).toBe(true);
  });
});
