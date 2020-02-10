// refer corvid-cli

exports.echo = "echo hello from terminal";

exports.login = "npx corvid login";
exports.logout = "npx corvid logout";
exports.openEditor = "npx corvid open-editor";
exports.pull = "npx corvid pull";
exports.push = "npx corvid push";

exports.corvidNewApp = (folderName, url) =>{
    return `npx create-corvid-app ${folderName} ${url}`;
}


