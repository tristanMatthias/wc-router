const path = require('path');
const SRC_PATH = path.resolve(__dirname, 'src');
const DIST_PATH = path.resolve(__dirname, 'dist');
const ENV = process.env.NODE_ENV || 'local';


const HTMLPlugin = require('html-webpack-plugin');
const MinifyPlugin = require('babel-minify-webpack-plugin');

module.exports = {
    entry: path.resolve(SRC_PATH, 'bundle.js'),
    output: {
        filename: 'wc-router.min.js',
        path: path.resolve(DIST_PATH),
        publicPath: '/'
    },
    devServer: {
        historyApiFallback: {
            index: '/'
        }
    },
    module: {
        loaders: [{
                test: /\.js$/,
                exclude: /(node_modules)/,
                loader: 'babel-loader'
            }
        ]
    },
    plugins: [
        new HTMLPlugin({
            template: './index.html'
        })
    ],
    resolve: {
        alias: {
            'lib': path.join(SRC_PATH, 'lib')
        }
    }
};

if (ENV === 'production') {
    module.exports.plugins.push(new MinifyPlugin());
}
