const path = require('path');
module.exports = {
    entry: {
        'client': './src/client.js',
        'background': './src/background.js'
    },
    output: {
        path: path.resolve('dist/js'),
        filename: '[name]-bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            }, {
                test: /\.jsx$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            }
        ]
    }
}