import typescript from '@rollup/plugin-typescript'
import livereload from 'rollup-plugin-livereload'
import serve from 'rollup-plugin-serve'

const path = require('path')
const resolvDir = (dir) => path.join(__dirname, dir)

const config = {
    input: './src/index.ts',
    output: {
        file: 'lib/bundle.js',
        format: 'umd',
        name: 'Flow',
    },
    plugins: [
        typescript(),
        livereload(),
        serve({
            port: 9090,
            contentBase: ['demo', 'lib'],
        }),
    ],
}

export default config
