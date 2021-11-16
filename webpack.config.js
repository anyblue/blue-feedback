const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const md5 = require('md5');
const {name} = require('./package.json');
const affix = md5(path.parse(name)).slice(0, 5); // 将目录名md5作为CssModule的后缀

function resolve(dir) {
    return path.join(__dirname, dir);
}

module.exports = (env, argv) => {
    const isDev = argv.mode === 'development';
    return {
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
            alias: {
                '@': resolve('src'),
                'src': resolve('src'),
            },
        },
        output: {
            clean: true,
            path: resolve('./dist'),
            filename: '[name].umd.js',
            library: 'Feedback',
            libraryTarget: 'umd',
        },
        module: {
            rules: [
                {
                    test: /\.ts$/i,
                    use: [
                        'babel-loader',
                        {
                            loader: 'ts-loader',
                            options: {configFile: isDev ? 'tsconfig.json' : 'tsconfig.build.json'},
                        },
                        'eslint-loader',
                    ],
                    exclude: /node_modules/,
                },
                {
                    test: /\.js$/i,
                    exclude: /(node_modules)/,
                    use: {
                        loader: 'babel-loader',
                    },
                },
                {
                    test: /\.(less|css)$/i,
                    use: [
                        'style-loader',
                        {
                            loader: 'css-loader',
                            options: {
                                modules: {
                                    localIdentName: `blue_[local]_${affix}`,
                                },
                            },
                        },
                        'less-loader',
                    ],
                },
                {
                    test: /\.(png|svg|jpg|jpeg|gif)$/i,
                    type: 'asset',
                },
            ],
        },
    };
};
