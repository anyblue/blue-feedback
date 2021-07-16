var path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
var md5 = require('md5');

var affix = md5(path.parse(__dirname)).slice(0, 5); // 将目录名md5作为CssModule的后缀

function resolve(dir) {
    return path.join(__dirname, dir);
}
module.exports = (env, argv) => {
    const isDev = argv.mode === 'development';
    return {
        // todo: 切换本地调试入口
        entry: isDev ? resolve('./example/demo.ts') : resolve('./src/index.ts'),
        devServer: {
            contentBase: resolve('./dist'),
            overlay: {
                errors: true,
            },
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: resolve('./index.html'),
            }),
        ],
        resolve: {
            extensions: ['.ts', '.js'],
        },
        output: {
            clean: true,
            path: resolve('./dist'),
            filename: '[name].min.js',
            library: 'Feedback',
            libraryTarget: 'umd'
        },
        module: {
            rules: [
                {
                    test: /\.ts$/i,
                    use: ['babel-loader', 'ts-loader', 'eslint-loader'],
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
                                    localIdentName: `blue_[local]_${affix}`,
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
                    type: 'asset',
                },
            ],
        }
    };
};
  