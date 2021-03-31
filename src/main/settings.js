const electron = require('electron');
const path = require('path');
const fs = require('fs');

export class Settings {
  constructor(opts) {
    // Renderer process has to get `app` module via `remote`, whereas the main process can get it directly
    // app.getPath('userData') will return a string of the user's app data directory path.
    const userDataPath = (electron.app || electron.remote.app).getPath('userData');
    // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
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

// expose the class
//module.exports = Store;
