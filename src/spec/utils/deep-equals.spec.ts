import { deepEquals } from '../../main/utils/deep-equals';

describe('deepEquals() returns true where expected', () => {
  test.each([
    [1, 1],
    [[1], [1]],
    [{a: 1}, {a: 1}],
    [NaN, NaN],
    [Infinity, Infinity],
  ] as [any, any][])('deepEquals(%j, %j)', (left, right) => {
    expect(deepEquals(left, right)).toBeTruthy();
  });
});

describe('deepEquals() returns false where expected', () => {
  test.each([
    [1, '1'],
    ['1', 1],
    [1, 2],
    [2, 1],
    [1, [1]],
    [[1], 1],
    [[1], {0: 1, length: 1}],
    [{0: 1, length: 1}, [1]],
    [[1], [2]],
    [[2], [1]],
    [[1], [1, 2]],
    [[1, 2], [1]],
    [{a: 1}, {a: 2}],
    [{a: 2}, {a: 1}],
    [{a: 1}, {a: 1, b: 2}],
    [{a: 1, b: 2}, {a: 1}],
  ] as [any, any][])('deepEquals(%j, %j)', (left, right) => {
    expect(deepEquals(left, right)).toBeFalsy();
  });
});
