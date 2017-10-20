/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Relay, BehaviorRelay } from '../dist/RxRelay';
import { Observable, Observer } from 'rxjs';

describe('BehaviorRelay', () => {
  it('should extend Relay', () => {
    const relay = new BehaviorRelay(null);
    expect(relay).toMatchObject(new Relay());
  });

  it('should have a getValue() method to retrieve the current value', () => {
    const relay = new BehaviorRelay('fitzpasd');
    expect(relay.getValue()).toBe('fitzpasd');

    relay.next('ms');

    expect(relay.getValue()).toBe('ms');
  });

  it('should not allow you to set `value` directly', () => {
    const relay = new BehaviorRelay('fitzpasd');

    try {
      // XXX: escape from readonly restriction for testing.
      (relay as any).value = 'ms';
    } catch (e) {
      //noop
    }

    expect(relay.getValue()).toBe('fitzpasd');
    expect(relay.value).toBe('fitzpasd');
  });

  it('should still allow you to retrieve the value from the value property', () => {
    const relay = new BehaviorRelay('fuzzy');
    expect(relay.value).toBe('fuzzy');
    relay.next('bunny');
    expect(relay.value).toBe('bunny');
  });

  it('should start with an initialization value', () => {
    const relay = new BehaviorRelay('foo');
    const expected = ['foo', 'bar'];
    let i = 0;

    relay.subscribe(x => {
      expect(x).toBe(expected.shift());
    });

    relay.next('bar');
    expect(expected).toEqual([]);
  });

  it('should pump values to multiple subscribers', () => {
    const relay = new BehaviorRelay('init');
    const expected = ['init', 'foo', 'bar'];
    let i = 0;
    let j = 0;

    relay.subscribe((x: string) => {
      expect(x).toBe(expected[i++]);
    });

    relay.subscribe((x: string) => {
      expect(x).toBe(expected[j++]);
    });

    expect(relay.observers.length).toBe(2);
    relay.next('foo');
    relay.next('bar');
    expect(i).toBe(3);
    expect(j).toBe(3);
  });

  it('should pass values nexted after a complete', () => {
    const relay = new BehaviorRelay('init');
    const results = [];

    relay.subscribe((x: string) => {
      results.push(x);
    });

    expect(results).toEqual(['init']);

    relay.next('foo');
    expect(results).toEqual(['init', 'foo']);

    relay.complete();
    expect(results).toEqual(['init', 'foo']);

    relay.next('bar');
    expect(results).toEqual(['init', 'foo', 'bar']);
  });

  it('should pass values nexted after an error', () => {
    const relay = new BehaviorRelay('init');
    const results = [];

    relay.subscribe((x: string) => {
      results.push(x);
    });

    expect(results).toEqual(['init']);

    relay.next('foo');
    expect(results).toEqual(['init', 'foo']);

    relay.error(new Error());
    expect(results).toEqual(['init', 'foo']);

    relay.next('bar');
    expect(results).toEqual(['init', 'foo', 'bar']);
  });

  it('should clean out unsubscribed subscribers', () => {
    const relay = new BehaviorRelay('init');

    const sub1 = relay.subscribe((x: string) => {
      expect(x).toEqual('init');
    });

    const sub2 = relay.subscribe((x: string) => {
      expect(x).toEqual('init');
    });

    expect(relay.observers.length).toBe(2);
    sub1.unsubscribe();
    expect(relay.observers.length).toBe(1);
    sub2.unsubscribe();
    expect(relay.observers.length).toBe(0);
  });

  it('should replay the previous value when subscribed', () => {
    const relay = new BehaviorRelay('init');
    const results1 = [];
    const results2 = [];

    relay.subscribe(x => results1.push(x));
    relay.next('foo');
    relay.subscribe(x => results2.push(x));
    relay.next('bar');
    
    expect(results1).toEqual(['init', 'foo', 'bar']);
    expect(results2).toEqual(['foo', 'bar']);
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

    const relay = new BehaviorRelay(0);
    const expected = [0, 1, 2, 3, 4, 5];

    relay.error = jest.fn();

    relay.subscribe(
      x => expect(x).toBe(expected.shift()));

    source.subscribe(relay);
    expect(expected).toEqual([]);
    expect(relay.error).toBeCalled();
  });

  it('should be an Observer which can be given to Observable.subscribe (without error)', () => {
    const source = Observable.of(1, 2, 3, 4, 5);

    const relay = new BehaviorRelay(0);
    const expected = [0, 1, 2, 3, 4, 5];

    relay.complete = jest.fn();

    relay.subscribe(
      x => expect(x).toBe(expected.shift()));

    source.subscribe(relay);
    expect(expected).toEqual([]);
    expect(relay.complete).toBeCalled();
  });
});
