import { describe, expect, it } from 'vitest';
import { computeKeyboardStates, evaluateGuess } from './evaluate';

describe('evaluateGuess', () => {
  it('marks every letter correct on an exact match', () => {
    expect(evaluateGuess('PRISM', 'PRISM').map((l) => l.state)).toEqual([
      'correct',
      'correct',
      'correct',
      'correct',
      'correct',
    ]);
  });

  it('mixes correct, present, and absent in a single guess', () => {
    // CRUMB vs PRISM: R lines up (index 1, correct); M is in PRISM but at
    // the wrong spot (index 3, present); C, U, B don't appear at all.
    expect(evaluateGuess('CRUMB', 'PRISM').map((l) => l.state)).toEqual([
      'absent',
      'correct',
      'absent',
      'present',
      'absent',
    ]);
  });

  it('marks a correct-position duplicate first, leaving the extra copy absent', () => {
    // Answer ULTRA has one L, at index 1. Guess ALLEY places an L at index 1
    // (correct) and another at index 2 — with no L left in the pool, that
    // second L must be absent rather than present.
    expect(evaluateGuess('ALLEY', 'ULTRA').map((l) => l.state)).toEqual([
      'present',
      'correct',
      'absent',
      'absent',
      'absent',
    ]);
  });

  it('only marks as many duplicate present letters as the answer actually has', () => {
    // Answer MODEL has a single E. Guess ELIDE has two E's, at index 0 and
    // index 4 — the first (in left-to-right order) consumes the one E in the
    // pool and is present; the second finds none left and is absent.
    expect(evaluateGuess('ELIDE', 'MODEL').map((l) => l.state)).toEqual([
      'present',
      'present',
      'absent',
      'present',
      'absent',
    ]);
  });

  it('mixes a correct duplicate with a present duplicate of a different letter', () => {
    // Answer ELDER has one L and two E's. Guess LEVEL's second E lands at
    // index 3, matching one of the answer's E's exactly (correct); its L's
    // are both wrong-place, but only one L is available so just the first
    // (leftmost) is present and the other is absent.
    expect(evaluateGuess('LEVEL', 'ELDER').map((l) => l.state)).toEqual([
      'present',
      'present',
      'absent',
      'correct',
      'absent',
    ]);
  });
});

describe('computeKeyboardStates', () => {
  it('keeps the best known state per letter across guesses', () => {
    const states = computeKeyboardStates(['CRUMB', 'PRISM'], 'PRISM');
    expect(states.R).toBe('correct');
    expect(states.M).toBe('correct');
    expect(states.C).toBe('absent');
    expect(states.B).toBe('absent');
  });

  it('does not downgrade a letter already known correct', () => {
    const states = computeKeyboardStates(['SPARE', 'ERASE'], 'ERASE');
    expect(states.E).toBe('correct');
  });
});
