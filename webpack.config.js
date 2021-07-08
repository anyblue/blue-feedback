var path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

function resolve(dir) {
    return path.join(__dirname, dir);
}
module.exports = {
    // todo: 切换本地调试入口
    entry: resolve('./demo.ts'),
    devServer: {
        contentBase: resolve('./dist'),
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: resolve('./index.html'),
        }),
    ],
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        clean: true,
        path: resolve('./dist'),
        filename: 'js/[name].[chunkhash].min.js',
        library: {
            name: 'feedback',
            type: 'umd',
        }
    },
    module: {
        rules: [
            {
                test: /\.ts$/i,
                use: ['babel-loader', 'ts-loader'],
                exclude: /node_modules/,
            },
            {
                test: /\.js$/i,
                exclude: /(node_modules)/,
                use: {
                  loader: 'babel-loader'
                }
            },
            {
                test: /\.less$/i,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                localIdentName: '[local]_[hash:5]',
                            }
                        }
                    },
                    'less-loader'
                ]
            },
            {
                test: /\.css$/i,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                localIdentName: `[local]_[hash:5]`,
                            }
                        }
                    }
                ]
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
        ],
    }
};
  