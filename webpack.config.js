const path = require('path');
const BitBarPlugin = require('bitbar-webpack-progress-plugin');

const PATH_SRC = path.resolve(__dirname, 'src');
const PATH_DIST = path.resolve(__dirname, '_bundles');


module.exports = {
    entry: {
        "wc-router": path.join(PATH_SRC, 'index.ts'),
    },
    output: {
        filename: '[name].js',
        path: PATH_DIST,
        libraryTarget: 'umd',
        library: 'wc-router',
        umdNamedDefine: true
    },
    module: {
        rules: [
            {
                test: /\.ts/,
                loader: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    plugins: [
        new BitBarPlugin()
    ]
}
