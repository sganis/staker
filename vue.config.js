module.exports = {
    pluginOptions: {
        electronBuilder: {
            mainProcessFile: 'src/main/background.js',
            rendererProcessFile: 'src/renderer/index.js',
            preload: 'src/main/preload.js', 
            appId: "com.chaintrust.staker",
            outputDir: "dist",
            builderOptions: {
                // asar: false,
                win: {
                    target: 'dir',
                    icon: "src/resources/icons/icon.ico"
                },
                linux: {
                    target: 'dir',
                    category: 'System',
                    icon: "src/resources/icons/icon.png"
                },
                mac: {
                    target: 'dir',
                    category: "public.app-category.developer-tools",
                    icon: "src/resources/icons/icon.icns"
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