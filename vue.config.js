module.exports = {
    pluginOptions: {
        electronBuilder: {
            mainProcessFile: 'src/main/background.js',
            rendererProcessFile: 'src/renderer/index.js',
            preload: 'src/main/preload.js', 
            appId: "staker",
            outputDir: "dist",
            builderOptions: {
                win: {
                    target: 'dir',
                },
                linux: {
                    target: 'dir',
                    category: 'System',
                },
                mac: {
                    target: 'dir',
                    category: "public.app-category.developer-tools"
                },
                directories: {
                    buildResources: "resources/icons",
                },
                extraFiles: [
                    {
                      "from": "resources/scripts",
                      "to": "resources/scripts",
                      "filter": ["**/*"]
                    }
                ]
            }           
        },        
    },
};