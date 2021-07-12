var path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
var md5 = require('md5');

var affix = md5(path.parse(__dirname)).slice(0, 5); // 将目录名md5作为CssModule的后缀

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
                                localIdentName: `blue_[local]_${affix}`,
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
  