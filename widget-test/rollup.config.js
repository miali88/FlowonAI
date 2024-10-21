import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';
import replace from '@rollup/plugin-replace';

export default defineConfig({
  input: 'src/main.tsx',
  output: {
    file: 'dist/embed.min.js',
    format: 'iife',
    name: 'EmbeddedChatbot',
  },
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      preventAssignment: true
    }),
    resolve({
      browser: true,
      preferBuiltins: false,
    }),
    commonjs(),
    typescript({ tsconfig: './tsconfig.app.json' }),
    postcss({
      extensions: ['.css'],
      minimize: true,
      inject: true,
    }),
    terser(),
  ],
});
