import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
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
        nodeResolve(),
        commonjs(),
        livereload(),
        serve({
            port: 9090,
            contentBase: ['demo', 'lib'],
        }),
    ],
    watch: {
        chokidar: {
            usePolling: true,
        },
        include: 'src/**',
    },
}

export default config
