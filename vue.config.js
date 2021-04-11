module.exports = {
    pluginOptions: {
        electronBuilder: {
            mainProcessFile: 'src/main/background.js',
            rendererProcessFile: 'src/renderer/index.js',
            preload: 'src/main/preload.js', 
            appId: "com.chaintrust.staker",
            outputDir: "dist",
            builderOptions: {
                win: {
                    target: 'dir',
                    icon: "src/resources/icons/icon.ico"
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
                    buildResources: "src/resources",
                },
                extraFiles: [
                        "tool/*.py", "tool/*.sh",                  
                ]
            }           
        },        
    },
};