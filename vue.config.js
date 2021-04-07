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
                    target: 'portable',
                },
                linux: {
                    target: 'tar.gz',
                    category: 'System',
                },
                mac: {
                    target: 'dmg',
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