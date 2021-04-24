const electron = require('electron');
const path = require('path');
const fs = require('fs');

export class Settings {
  constructor(opts) {
    const userData = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.staker")
    console.log('data path: '+userData);
    const userDataPath = path.join(userData, 'staker');
    if (!fs.existsSync(userDataPath)){
      fs.mkdirSync(userDataPath);
    }
    this.path = path.join(userDataPath, opts.configName + '.json');
    this.data = parseDataFile(this.path, opts.defaults);
  }
  
  // This will just return the property on the `data` object
  get(key, defaults='') {
    if (key in this.data)
      return this.data[key];
    else
      return defaults;
  }
  
  // ...and this will set it
  set(key, val) {
    if (!(key in this.data && this.data[key] === val)) {
      this.data[key] = val;
      fs.writeFileSync(this.path, JSON.stringify(this.data));
    }
    return val;
  }
}

function parseDataFile(filePath, defaults) {
  try {
    return JSON.parse(fs.readFileSync(filePath));
  } catch(error) {
    return defaults;
  }
}

const settings = new Settings({
  configName: 'config',
  defaults: {
    windowBounds: { x: 0, y: 0, width: 800, height: 600 },
  }
});

export {settings}

 // expose the class
//module.exports = Store;
