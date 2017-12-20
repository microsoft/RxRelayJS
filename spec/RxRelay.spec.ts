/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Relay } from '../dist/RxRelay';

describe('RxRelay', () => {
  it('should not import all of RxJS', () => {
    expect(Relay.prototype.zip).toBe(undefined);
    expect(Relay.prototype.mergeMap).toBe(undefined);
  });
});
