const path = require('path');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
module.exports = {
entry: './app.js',
mode: 'development',
output: {
filename: 'bundle.js',
path: path.resolve(__dirname, './'),
},
plugins: [
new NodePolyfillPlugin()
],
module: {
rules: [
{
test: /\.css$/i,
use: ['style-loader', 'css-loader'], //always put style-loader before css-loader
},
],
},
};