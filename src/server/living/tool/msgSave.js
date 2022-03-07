const fs = require("fs")

class msgSave {
    constructor(fileName, config = { encoding: 'utf8', flag: 'a' }) {
        this.fileName = fileName
        this.config = config
    }
    write(message) {
        fs.writeFile(this.fileName, (JSON.stringify(message) + ','), this.config, err => {
            if (err) throw err;
            // console.log('写入成功');
        })
    }
}

module.exports = msgSave