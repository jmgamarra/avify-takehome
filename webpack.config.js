const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isDevelopment = process.env.NODE_ENV === 'development';
const host = 'localhost';
const port = 8080;

module.exports = {
    mode: isDevelopment ? 'development' : 'production',
    context: path.resolve(__dirname, 'src'),
    target: 'web',
    entry: {
        app: ['./index.tsx']
    },
    output: {
        filename: '[name]-[contenthash:6].bundle.js',
        path: path.join(__dirname, isDevelopment ? './build/www' : './dist'),
        publicPath: isDevelopment ? `http://${host}:${port}/` : './', // Público relativo en producción
    },
    resolve: {
        mainFields: ['browser', 'module', 'main'],
        extensions: ['.js', '.json', '.jsx', '.ts', '.tsx']
    },
    module: {
        rules: [
            {
                test: /\.([jt])s(x?)$/,
                exclude: /node_modules/,
                use: 'babel-loader',
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
            },
            {
                test: /\.(png|jpg|gif)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'img/[name]-[contenthash:6][ext]'
                }
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html'
        }),
        new MiniCssExtractPlugin({
            filename: '[name]-[contenthash:6].css',
            chunkFilename: '[id].css'
        })
    ],
    devServer: {
        port,
        host,
        static: path.resolve(__dirname, 'src')
    },
};
