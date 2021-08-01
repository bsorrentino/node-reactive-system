
import { compareTopics } from '../src/channel';

jest.setTimeout(5000)

describe('> Topic Comparator', () => {

  it('# should correctly compare topics', () => {


    expect(compareTopics('test', 'test')).toBe(true);
    expect(compareTopics('test.one', 'test.#')).toBe(true)
    expect(compareTopics('test.one.two', 'test.#')).toBe(true)
    expect(compareTopics('test.one.two', 'test.#.two')).toBe(true)
    expect(compareTopics('test.one', 'test.*')).toBe(true)
    expect(compareTopics('test.two', 'test.#.two')).toBe(true)
    expect(compareTopics('test.one.two', '#')).toBe(true)
    expect(compareTopics('test.P1', '*.P1')).toBe(true)
  });

  it('# should correctly fail topics', () => {
    expect(compareTopics('test.one', 'test')).toBe(false)
    expect(compareTopics('test.one', 'test.#.two')).toBe(false)
    expect(compareTopics('test.two', 'test.*.two')).toBe(false)
    expect(compareTopics('test.one.two', 'test.*')).toBe(false)
    expect(compareTopics('test.one.two', '*.two')).toBe(false)
    expect(compareTopics('test.one.two', '*.one')).toBe(false)
    expect(compareTopics('test.one.two', '*')).toBe(false)
    expect(compareTopics('test.P10', '*.P1')).toBe(false)
  });

});
