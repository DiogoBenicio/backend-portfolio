import { describe, it, expect } from 'vitest';
import { classifyScore, calculateNps, getZone } from '../domain/model/NpsSummary';

describe('classifyScore', () => {
  it.each([9, 10])('score %i deve ser promoter', (score) => {
    expect(classifyScore(score)).toBe('promoter');
  });

  it.each([7, 8])('score %i deve ser passive', (score) => {
    expect(classifyScore(score)).toBe('passive');
  });

  it.each([0, 1, 5, 6])('score %i deve ser detractor', (score) => {
    expect(classifyScore(score)).toBe('detractor');
  });
});

describe('calculateNps', () => {
  it('deve retornar 0 quando total é 0', () => {
    expect(calculateNps(0, 0, 0)).toBe(0);
  });

  it('deve retornar 100 com todos promotores', () => {
    expect(calculateNps(10, 0, 10)).toBe(100);
  });

  it('deve retornar -100 com todos detratores', () => {
    expect(calculateNps(0, 10, 10)).toBe(-100);
  });

  it('deve retornar 0 quando promotores === detratores', () => {
    expect(calculateNps(2, 2, 5)).toBe(0);
  });

  it('deve calcular corretamente com mix de classificações', () => {
    // 3 promotores, 1 detrator, 5 total → ((3-1)/5)*100 = 40
    expect(calculateNps(3, 1, 5)).toBe(40);
  });

  it('deve arredondar 1 casa decimal', () => {
    // ((3-1)/6)*100 = 33.333... → 33.3
    expect(calculateNps(3, 1, 6)).toBe(33.3);
  });
});

describe('getZone', () => {
  it('score <= 0 deve ser Crítico', () => {
    expect(getZone(0)).toBe('Crítico');
    expect(getZone(-50)).toBe('Crítico');
  });

  it('score entre 1 e 50 deve ser Aperfeiçoamento', () => {
    expect(getZone(1)).toBe('Aperfeiçoamento');
    expect(getZone(50)).toBe('Aperfeiçoamento');
  });

  it('score entre 51 e 75 deve ser Qualidade', () => {
    expect(getZone(51)).toBe('Qualidade');
    expect(getZone(75)).toBe('Qualidade');
  });

  it('score acima de 75 deve ser Excelência', () => {
    expect(getZone(76)).toBe('Excelência');
    expect(getZone(100)).toBe('Excelência');
  });
});
