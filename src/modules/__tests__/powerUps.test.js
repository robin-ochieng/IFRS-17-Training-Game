import {
  INITIAL_POWER_UPS,
  canUsePowerUp,
  consumePowerUp,
  refreshPowerUps,
  sanitizePowerUps,
  getPowerUpInfo,
} from '../powerUps';

describe('power-up allowance', () => {
  test('initial and refreshed allowance is eliminate:2, hint:3 with no skip', () => {
    expect(INITIAL_POWER_UPS).toEqual({ eliminate: 2, hint: 3 });
    expect(refreshPowerUps()).toEqual({ eliminate: 2, hint: 3 });
  });

  test('refreshPowerUps returns a new object each call', () => {
    expect(refreshPowerUps()).not.toBe(refreshPowerUps());
  });
});

describe('consumePowerUp', () => {
  test('decrements and stops at zero', () => {
    let p = { eliminate: 1, hint: 0 };
    p = consumePowerUp(p, 'eliminate');
    expect(p.eliminate).toBe(0);
    expect(consumePowerUp(p, 'eliminate')).toEqual(p); // no-op at zero
    expect(consumePowerUp(p, 'hint')).toEqual(p);      // no-op at zero
    expect(canUsePowerUp(p, 'eliminate')).toBe(false);
  });
});

describe('sanitizePowerUps', () => {
  test('ignores unknown keys from old saves (skip)', () => {
    expect(sanitizePowerUps({ skip: 3, hint: 1, eliminate: 0 })).toEqual({ eliminate: 0, hint: 1 });
  });

  test('fills missing keys with full allowance and clamps overlarge values', () => {
    expect(sanitizePowerUps({ hint: 99 })).toEqual({ eliminate: 2, hint: 3 });
    expect(sanitizePowerUps(undefined)).toEqual({ eliminate: 2, hint: 3 });
    expect(sanitizePowerUps(null)).toEqual({ eliminate: 2, hint: 3 });
    expect(sanitizePowerUps({ eliminate: -1, hint: 'x' })).toEqual({ eliminate: 2, hint: 3 });
  });
});

describe('getPowerUpInfo', () => {
  test('describes eliminate and hint; skip is gone', () => {
    expect(getPowerUpInfo('eliminate').name).toBe('Eliminate');
    expect(getPowerUpInfo('hint').name).toBe('Hint');
    expect(getPowerUpInfo('skip')).toBeNull();
  });
});
