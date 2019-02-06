import { createConfig } from '../index';

describe('createConfig', () => {
  it('should createConfig', () => {
    const cfg = createConfig();
    expect(cfg.length).toBeGreaterThan(0);
    expect(cfg.length).toBe(3);
  });
  it('should use umd format only', () => {
    const cfg = createConfig({
      formats: ['umd'],
    });
    expect(cfg[0].output.format).toBe('umd');
    expect(cfg.length).toBe(1);
  });
  it('should throw because of wrong pkgPath', () => {
    const createCfg = () => createConfig({
      pkgPath: '/home',
    });
    expect(createCfg).toThrow();
  });
  it('should use multiple chunk only with es format', () => {
    const cfg = createConfig({
      multipleChunk: true,
    });
    expect(cfg[0].output.format).toBe('es');
    expect(cfg.length).toBe(1);
  });
});
