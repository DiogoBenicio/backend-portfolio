import { describe, it, expect } from 'vitest';
import { isValidScore } from '../domain/model/NpsResponse';

describe('isValidScore', () => {
  it.each([0, 1, 5, 9, 10])('score %i deve ser válido', (score) => {
    expect(isValidScore(score)).toBe(true);
  });

  it.each([-1, 11, 100])('score %i fora do range deve ser inválido', (score) => {
    expect(isValidScore(score)).toBe(false);
  });

  it.each([5.5, 0.1, 9.9])('score decimal %f deve ser inválido', (score) => {
    expect(isValidScore(score)).toBe(false);
  });

  it('NaN deve ser inválido', () => {
    expect(isValidScore(NaN)).toBe(false);
  });
});
