module.exports = {
    pluginOptions: {
        electronBuilder: {
            mainProcessFile: 'src/main/background.js',
            rendererProcessFile: 'src/renderer/app.js'
        },
    },
};