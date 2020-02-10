
const fs = require('fs');


function checkCreateDir(dir) {
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
}

function getList(dir) {
    let folders = fs.readdirSync(dir);
    let json = folders.map(folder=>{
        return {
            siteName : folder.toUpperCase().replace(/-/g , " "),
            slug : folder,
            lastUpdated: new Date(), // TODO: NEED TO TRACK THE LAST PULL
            timeAgo : lastUpdated
        }
    })
    return json;
}

module.exports.checkCreateDir = checkCreateDir;
module.exports.getList = getList;
