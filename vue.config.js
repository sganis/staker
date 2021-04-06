module.exports = {
    pluginOptions: {
        electronBuilder: {
            mainProcessFile: 'src/main/background.js',
            rendererProcessFile: 'src/renderer/index.js',
            preload: 'src/main/preload.js', 
            builderOptions: {
                extraFiles: [
                    {
                      "from": "src/scripts",
                      "to": "scripts",
                      "filter": ["**/*"]
                    }
                ]
            }           
        },        
    },
};