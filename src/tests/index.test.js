/**
 * Testing example
 */
import DemoClass from '../index';

describe('DemoClass', () => {
  let demoClass;
  beforeEach(() => {
    demoClass = new DemoClass();
  });
  it('should be the DemoClass', () => {
    expect(demoClass instanceof DemoClass).toBe(true);
  });
  it('should be the static test', () => {
    expect(demoClass.getTestStatic()).toBe('This is a static test');
  });
  it('should be the test attribute', () => {
    expect(demoClass.getTestAttribute()).toBe('This is a test attribute');
  });
  it('should set the test attribute', () => {
    demoClass.setTestAttribute('test');
    expect(demoClass.getTestAttribute()).toBe('test');
  });
  it('should include a in list', () => {
    expect(demoClass.hasInList('a')).toBe(true);
  });
  it('should get replaced env', () => {
    expect(demoClass.getReplacedEnv()).toBe('test');
  });
  it('should get rest from spread', () => {
    expect(demoClass.getIsSpreadActive()).toEqual(true);
  });
  it('should get rest from spread', () => {
    expect(demoClass.getRest()).toEqual({
      isTestLiving: true,
      list: ['a', 'b'],
    });
  });
});
