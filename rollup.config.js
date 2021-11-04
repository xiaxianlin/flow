import typescript from 'rollup-plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import livereload from 'rollup-plugin-livereload'
import serve from 'rollup-plugin-serve'

const config = {
    input: './src/index.ts',
    output: {
        file: 'lib/bundle.js',
        format: 'umd',
        name: 'Flow',
    },
    plugins: [
        typescript(),
        commonjs(),
        livereload(),
        serve({
            port: 9090,
            contentBase: ['demo', 'lib'],
        }),
    ],
}

export default config
