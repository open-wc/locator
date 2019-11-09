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
    // resolve bare import specifiers
    resolve(),
    indexHTML(),
    copy({
      files: ['./src/*.png', './src/*.svg'],
      dest: 'dist',
    })
  ],
},
{
  input: './src/content_script.js',
  output: {
    dir: 'dist',
    format: 'iife',
  },
  plugins: [
    resolve()
  ]
}];