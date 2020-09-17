import resolve from 'rollup-plugin-node-resolve';
import indexHTML from 'rollup-plugin-index-html';
import copy from 'rollup-plugin-cpy'

export default [{
  input: './src/index.html',
  output: {
    dir: 'dist',
    format: 'esm',
  },
  plugins: [
    resolve(),
    indexHTML(),
    copy({
      files: ['./src/**/*.png', './src/**/*.svg'],
      dest: 'dist/icons',
    })
  ],
},
// content script
{
  input: './src/scripts/content_script.js',
  output: {
    dir: 'dist',
    format: 'iife',
  },
  plugins: [
    resolve()
  ]
},
// background script
{
  input: './src/scripts/background_script.js',
  output: {
    dir: 'dist',
    format: 'iife',
  },
  plugins: [
    resolve()
  ]
}];
