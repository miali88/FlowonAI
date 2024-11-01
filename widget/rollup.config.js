import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';
import replace from '@rollup/plugin-replace';
import json from '@rollup/plugin-json';
import strip from '@rollup/plugin-strip';
import postcssImport from 'postcss-import';
import autoprefixer from 'autoprefixer';
import fs from 'fs';

export default defineConfig({
  input: 'src/main.tsx',
  output: {
    file: 'dist/embed.min.js',
    format: 'iife',
    name: 'FlowonWidget',
    sourcemap: true,
    globals: {},
    banner: '/* Flowon Widget v' + process.env.npm_package_version + ' */',
    intro: '(function() { "use strict"; var global = typeof window !== "undefined" ? window : this;',
    outro: '})();'
  },
  plugins: [
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.WIDGET_VERSION': JSON.stringify(process.env.npm_package_version),
      include: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx']
    }),
    postcss({
      extensions: ['.css'],
      minimize: true,
      inject: true,
      modules: {
        generateScopedName: 'flowon-widget-[hash:base64:8]',
        scopeBehaviour: 'local',
      },
      extract: true,
      sourceMap: true,
      plugins: [
        postcssImport(),
        autoprefixer(),
      ],
      exclude: ['**/*.css?inline'],
      onExtract(getExtracted) {
        const extracted = getExtracted();
        if (extracted) {
          const cssText = extracted.code;
          return {
            id: 'generated-styles',
            code: `export default ${JSON.stringify(cssText)};`,
            map: { mappings: '' }
          };
        }
      }
    }),
    {
      name: 'css-inline',
      resolveId(source, importer) {
        if (source.endsWith('.css?inline')) {
          const path = source.replace('?inline', '');
          return this.resolve(path, importer)
            .then(resolved => resolved?.id);
        }
        return null;
      },
      async load(id) {
        if (id.endsWith('.css')) {
          try {
            const css = await fs.promises.readFile(id, 'utf-8');
            return `export default \`${css.replace(/`/g, '\\`')}\`;`;
          } catch (error) {
            console.error('Error loading CSS file:', id, error);
            return null;
          }
        }
        return null;
      }
    },
    strip({
      include: '**/*.mjs',
      comments: 'none',
    }),
    resolve({
      browser: true,
      preferBuiltins: false,
    }),
    commonjs(),
    json(),
    typescript({
      tsconfig: './tsconfig.app.json',
      compilerOptions: {
        allowImportingTsExtensions: true,
        noEmit: true,
      }
    }),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      presets: [
        '@babel/preset-env',
        ['@babel/preset-react', { runtime: 'automatic' }],
        '@babel/preset-typescript',
      ],
    }),
    terser(),
  ],
  external: [],
});
