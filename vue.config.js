module.exports = {
    pluginOptions: {
        electronBuilder: {
            mainProcessFile: 'src/main/index.js',
            rendererProcessFile: 'src/renderer/index.js',
            preload: 'src/main/preload.js',            
        },        
    },
};