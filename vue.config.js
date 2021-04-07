module.exports = {
    pluginOptions: {
        electronBuilder: {
            mainProcessFile: 'src/main/background.js',
            rendererProcessFile: 'src/renderer/index.js',
            preload: 'src/main/preload.js', 
            appId: "staker",
            outputDir: "dist",
            builderOptions: {
                directories: {
                    buildResources: "resources",
                },
                extraFiles: [
                    {
                      "from": "resources/scripts",
                      "to": "scripts",
                      "filter": ["**/*"]
                    }
                ]
            }           
        },        
    },
};