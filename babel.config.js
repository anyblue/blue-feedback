module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                targets: '> 1%, last 2 versions',
            },
        ],
    ],
    plugins: [
        '@babel/plugin-transform-runtime',
    ],
};
