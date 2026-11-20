import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getOutboundRel } from './outbound-rel';

describe('getOutboundRel', () => {
  it('marks a featured clinic outbound link as sponsored', () => {
    assert.equal(getOutboundRel(true), 'sponsored noopener noreferrer');
  });

  it('keeps a standard clinic outbound link as nofollow', () => {
    assert.equal(getOutboundRel(false), 'nofollow noopener noreferrer');
  });
});
