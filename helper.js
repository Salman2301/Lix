
const fs = require('fs');
const dir = './tmp';


function checkCreateDir(dir) {
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
}

module.exports.checkCreateDir = checkCreateDir;
