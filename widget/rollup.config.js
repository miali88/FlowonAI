import { defineConfig } from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import babel from '@rollup/plugin-babel';
import fs from 'fs';

export default defineConfig({
  input: 'src/main.tsx',
  output: {
    file: 'dist/embed.min.js',
    format: 'iife',
    name: 'FlowonWidget',
    sourcemap: true,
  },
  plugins: [
    resolve({
      browser: true,
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.css'],
      moduleDirectories: ['node_modules', 'src']
    }),
    
    {
      name: 'css-string',
      resolveId(source) {
        if (source.endsWith('.css?raw') || source.endsWith('.css')) {
          return source.replace('?raw', '');
        }
        return null;
      },
      async load(id) {
        if (id.endsWith('.css')) {
          try {
            const css = fs.readFileSync(id, 'utf-8');
            const minified = css
              .replace(/\s+/g, ' ')
              .replace(/\s*([{}:;,])\s*/g, '$1')
              .trim();
            return {
              code: `const css = ${JSON.stringify(minified)};\nexport default css;`,
              map: { mappings: '' }
            };
          } catch (error) {
            console.error(`Failed to load CSS file: ${id}`, error);
            return null;
          }
        }
        return null;
      }
    },
    
    typescript({
      tsconfig: './tsconfig.json',
      declaration: false,
    }),
    
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      presets: ['@babel/preset-react', '@babel/preset-typescript']
    }),
  ]
});