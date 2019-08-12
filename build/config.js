const path = require('path')
const buble = require('rollup-plugin-buble')
const replace = require('rollup-plugin-replace')
const cjs = require('rollup-plugin-commonjs')
const node = require('rollup-plugin-node-resolve')
const version = process.env.VERSION || require('../package.json').version
const banner =
    `/**
  * vanilla-dom-log v${version}
  * (c) ${new Date().getFullYear()} wizardpisces
  * @license MIT
  */`

const resolve = _path => path.resolve(__dirname, '../', _path)

const configs = {
    umdDev: {
        input: resolve('src/index.js'),
        file: resolve('dist/vanilla-dom-log.js'),
        format: 'umd',
        env: 'development'
    },
    umdProd: {
        input: resolve('src/index.js'),
        file: resolve('dist/vanilla-dom-log.min.js'),
        format: 'umd',
        env: 'production'
    },
    commonjs: {
        input: resolve('src/index.js'),
        file: resolve('dist/vanilla-dom-log.common.js'),
        format: 'cjs'
    },
    esm: {
        input: resolve('src/index.js'),
        file: resolve('dist/vanilla-dom-log.esm.js'),
        format: 'es'
    },
    'esm-browser-dev': {
        input: resolve('src/index.js'),
        file: resolve('dist/vanilla-dom-log.esm.browser.js'),
        format: 'es',
        env: 'development',
        // transpile: false
    },
    'esm-browser-prod': {
        input: resolve('src/index.js'),
        file: resolve('dist/vanilla-dom-log.esm.browser.min.js'),
        format: 'es',
        env: 'production',
        // transpile: false
    }
}

function genConfig(opts) {
    const config = {
        input: {
            input: opts.input,
            plugins: [
                node(),
                cjs(),
                replace({
                    __VERSION__: version
                })
            ]
        },
        output: {
            banner,
            file: opts.file,
            format: opts.format,
            name: 'VanillaDomLog'
        }
    }

    if (opts.env) {
        config.input.plugins.unshift(replace({
            'process.env.NODE_ENV': JSON.stringify(opts.env)
        }))
    }
    /**
     * use buble would change
     * `class TreeViewItem extends HTMLElement` to function which cause below error:
     * Failed to construct 'HTMLElement': Please use the 'new' operator, this DOM object constructor cannot be called as a function.
    */
    // if (opts.transpile !== false) {
    //     config.input.plugins.push(buble())
    // }

    return config
}

function mapValues(obj, fn) {
    const res = {}
    Object.keys(obj).forEach(key => {
        res[key] = fn(obj[key], key)
    })
    return res
}

module.exports = mapValues(configs, genConfig)