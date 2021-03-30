module.exports = {
    pluginOptions: {
        electronBuilder: {
            mainProcessFile: 'src/background.js',
            rendererProcessFile: 'src/app.js'
        },
    },
};