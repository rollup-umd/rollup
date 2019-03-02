const { existsSync } = require('fs');
const { join } = require('path');
const nodeResolve = require('rollup-plugin-node-resolve');
const replace = require('rollup-plugin-replace');
const commonjs = require('rollup-plugin-commonjs');
const inject = require('rollup-plugin-inject');
const babel = require('rollup-plugin-babel');
const json = require('rollup-plugin-json');
const { terser } = require('rollup-plugin-terser');
const cleanup = require('rollup-plugin-cleanup');
const visualizer = require('rollup-plugin-visualizer');
const builtins = require('rollup-plugin-node-builtins');

const defaultOptions = {
  /** choose the rollup output formats */
  formats: ['umd', 'cjs', 'es'],
  /** set the package.json path */
  pkgPath: join(process.cwd(), 'package.json'),
  /** set the declination path */
  declinationPath: join(process.cwd(), 'declination.json'),
  /** You must set output.dir instead of output.file when generating multiple chunks, this option will do it and keep only es format. */
  multipleChunk: false,
  /** rollup-plugin-node-resolve options (See https://github.com/rollup/rollup-plugin-node-resolve) */
  nodeResolveOptions: {},
  /** rollup-plugin-commonjs options (See https://github.com/rollup/rollup-plugin-commonjs) */
  commonjsOptions: {},
  /** rollup-plugin-replace options (See https://github.com/rollup/rollup-plugin-replace) */
  replaceOptions: {},
  /** rollup-plugin-inject options (See https://github.com/rollup/rollup-plugin-inject) */
  injectOptions: {},
  /** rollup-plugin-json options (See https://github.com/rollup/rollup-plugin-json) */
  jsonOptions: {},
  /** rollup-plugin-babel options (See https://github.com/rollup/rollup-plugin-babel) */
  babelOptions: {},
  /** rollup-plugin-cleanup options (See https://github.com/aMarCruz/rollup-plugin-cleanup) */
  cleanupOptions: {},
  /** Give pkg.formats priority if it exist in package.json */
  pkgFormatsPriority: true,
};

/**
 * @public
 * @name createConfig
 * @description
 * create rollup configuration for all rollup-umd projects
 * @param {object} [options={}] - options object for reconfiguration
 * @paran {array} [options.formats=['umd', 'cjs', 'es']] - output formats
 * @param {string} [options.pkgPath=package.json] - set the package.json path
 * @param {string} [options.declinationPath=declination.json] - set the declination.json path
 * @param {boolean} [options.multipleChunk=false] - You must set output.dir instead of output.file when generating multiple chunks, this option will do it and keep only es format
 * @param {string} [options.nodeResolveOptions={}] - rollup-plugin-node-resolve options (See https://github.com/rollup/rollup-plugin-node-resolve)
 * @param {object} [options.commonjsOptions={}] - rollup-plugin-commonjs options (See https://github.com/rollup/rollup-plugin-commonjs)
 * @param {object} [options.replaceOptions={}] - rollup-plugin-replace options (See https://github.com/rollup/rollup-plugin-replace)
 * @param {object} [options.injectOptions={}] - rollup-plugin-inject options (See https://github.com/rollup/rollup-plugin-inject)
 * @param {object} [options.jsonOptions={}] - rollup-plugin-json options (See https://github.com/rollup/rollup-plugin-json)
 * @param {object} [options.babelOptions={}] - rollup-plugin-babel options (See https://github.com/rollup/rollup-plugin-babel)
 * @param {object} [options.cleanupOptions={}] - rollup-plugin-cleanup options (See https://github.com/aMarCruz/rollup-plugin-cleanup)
 * @param {object} [options.pkgFormatsPriority={}] - Give pkg.formats priority if it exist in package.json (user can use pkg.formats = ['umd'] to specify the output formats)
 * @example
 * const { createConfig } = require('@rollup-umd/rollup');
 * const options = {}; // override any options here
 * module.exports = createConfig(options);
 * @returns {*}
 */
function createConfig(options = {}) {
  const opts = { ...defaultOptions, ...options };
  const pkgPath = join(opts.pkgPath);
  const declinationPath = join(opts.declinationPath);
  const pkg = existsSync(pkgPath) ? require(pkgPath) : new Error(`${opts.pkgPath} cannot be found`); // eslint-disable-line global-require
  // eslint-disable-next-line global-require
  const declination = existsSync(declinationPath) ? require(declinationPath) : {
    external: [],
    globals: {},
  };

  const formats = opts.pkgFormatsPriority && pkg.formats && !pkg.formats.length ? pkg.formats : opts.formats;
  const { namedExports, ...commonjsOptions } = opts.commonjsOptions;

  const processShim = '\0process-shim';
  const prod = process.env.PRODUCTION;
  const mode = prod ? 'production' : 'development';
  const { external, globals } = declination;

  console.log(`Creating ${mode} bundle...`);

  let output = prod ? [
    {
      name: pkg.name, exports: 'named', globals, file: `dist/${pkg.name}.min.js`, format: 'umd', sourcemap: true,
    },
    {
      name: pkg.name, exports: 'named', globals, file: `dist/${pkg.name}.cjs.min.js`, format: 'cjs', sourcemap: true,
    },
    {
      name: pkg.name, exports: 'named', globals, file: `dist/${pkg.name}.esm.js`, format: 'es', sourcemap: true,
    },
  ] : [
    {
      name: pkg.name, exports: 'named', globals, file: `dist/${pkg.name}.js`, format: 'umd', sourcemap: true,
    },
    {
      name: pkg.name, exports: 'named', globals, file: `dist/${pkg.name}.cjs.js`, format: 'cjs', sourcemap: true,
    },
    {
      name: pkg.name, exports: 'named', globals, file: `dist/${pkg.name}.esm.js`, format: 'es', sourcemap: true,
    },
  ];

  output = output.filter((o) => formats.includes(o.format));

  if (opts.multipleChunk) {
    output = output.filter((o) => ['es'].includes(o.format)).map((o) => {
      o.dir = o.file; // eslint-disable-line no-param-reassign
      delete o.file; // eslint-disable-line no-param-reassign
      return o;
    });
  }

  const plugins = [
    // Unlike Webpack and Browserify, Rollup doesn't automatically shim Node
    // builtins like `process`. This ad-hoc plugin creates a 'virtual module'
    // which includes a shim containing just the parts the bundle needs.
    {
      resolveId(importee) {
        if (importee === processShim) return importee;
        return null;
      },
      load(id) {
        if (id === processShim) return 'export default { argv: [], env: {} }';
        return null;
      },
    },
    builtins(),
    nodeResolve({
      browser: true,
      ...opts.nodeResolveOptions,
    }),
    commonjs({
      include: 'node_modules/**',
      namedExports: {
        react: ['cloneElement', 'createElement', 'PropTypes', 'Children', 'Component', 'createContext'],
        'react-is': ['isElement', 'isValidElementType', 'ForwardRef'],
        ...namedExports,
      },
      ...commonjsOptions,
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(prod ? 'production' : 'development'),
      ...opts.replaceOptions,
    }),
    inject({
      process: processShim,
      ...opts.injectOptions,
    }),
    json({
      ...opts.jsonOptions,
    }),
    babel({
      babelrc: false,
      exclude: 'node_modules/**',
      runtimeHelpers: true,
      ...opts.babelOptions,
    }),
    cleanup({
      ...opts.cleanupOptions,
    }),
  ];

  return output.map((o) => ({
    input: 'src/index.js',
    external,
    output: o,
    plugins: prod ? plugins.concat((o.format === 'es' ? [] : [terser()]).concat([visualizer({ filename: './bundle-stats.html' })])) : plugins,
  }));
}

module.exports = {
  createConfig,
};
