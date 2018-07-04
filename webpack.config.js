const path = require('path');

module.exports = {
    entry: './lib/client',
    output: {
        path: path.resolve(__dirname, 'out', 'js'),
        filename: 'index.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
    },
    devtool: 'source-map'
};