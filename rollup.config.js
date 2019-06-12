import babel from 'rollup-plugin-babel';
import sourcemaps from 'rollup-plugin-sourcemaps';
import {terser} from "rollup-plugin-terser";
import postcss from 'rollup-plugin-postcss'
import atImport from 'postcss-import';

/**
 * Both Babel and Rollup have features to combine the source maps of two consecutive transformations. It is therefore
 * important not to use both. Luckily, we can set Babel’s `inputSourceMap` option to false, in order to make Babel
 * ignore the source maps in src/target/js that were created by the TypeScript compiler.
 */
const inputSourceMap = false;

function defaults() {
  return {
    external: [
      '@fschopp/project-planning-for-you-track',
      's-array',
      's-js',
      'sortablejs',
      'surplus',
      'surplus-mixin-data'
    ],
    input: 'target/main/index.js',

    // Oddly, rollup 1.14.6 removes all class definitions if tree shaking is turned on.
    treeshake: false,
  };
}

function outputDefaults() {
  return {
    sourcemap: true,
    sourcemapExcludeSources: true,
    globals: {
      '@fschopp/project-planning-for-you-track': 'ProjectPlanningForYouTrack',
      's-array': 'SArray',
      's-js': 'S',
      'sortablejs': 'Sortable',
      'surplus': 'Surplus',
      'surplus-mixin-data': 'SurplusDataMixin',
    },
  };
}

export default [
  {
    ...defaults(),
    input: 'src/css/index.js',
    output: {
      ...outputDefaults(),
      file: 'dist/index.js',
      format: 'umd',
      name: 'ProjectPlanningUiForYouTrack',
    },
    plugins: [
      sourcemaps(),
      // Unfortunately, rollup 1.11.3 does not pick up the .babelrc.js file.
      babel({
        inputSourceMap,
        presets: ['@babel/preset-env'],
        plugins: ['babel-plugin-unassert']
      }),
      postcss({
        extract: true,
        plugins: [
          atImport(),
        ],
        // While we could set property 'sourceMap' to true in order to generate a source map, it unfortunately does not
        // have the correct relative path. The issue seems with rollup-plugin-postcss; it sets both the 'from' and 'to'
        // options to the same value. See:
        // https://github.com/egoist/rollup-plugin-postcss/blob/v2.0.3/src/postcss-loader.js#L104-L115
        // https://github.com/postcss/postcss-import
        // sourceMap: true,
      }),
    ]
  },
  {
    ...defaults(),
    input: 'src/css/index.js',
    output: {
      ...outputDefaults(),
      file: 'dist/index.min.js',
      format: 'umd',
      name: 'ProjectPlanningUiForYouTrack',
    },
    plugins: [
      sourcemaps(),
      // Unfortunately, rollup 1.11.3 does not pick up the .babelrc.js file.
      babel({
        inputSourceMap,
        presets: ['@babel/preset-env'],
        plugins: ['babel-plugin-unassert']
      }),
      terser(),
      postcss({
        extract: true,
        plugins: [
          atImport(),
        ],
        minimize: true,
      }),
    ]
  },
  {
    ...defaults(),
    output: {
      ...outputDefaults(),
      dir: 'dist/es6/',
      format: 'esm',
    },
    plugins: [
      sourcemaps(),
      babel({
        inputSourceMap,
        plugins: ['babel-plugin-unassert']
      }),
    ],
    preserveModules: true,
  },
];
