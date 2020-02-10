// refer corvid-cli
const shell = require('shelljs');
const {checkCreateDir, getList} = require("./helper"); // fs are handled by helper module

exports.echo = ()=>shell.exec("echo shelljs is working.");

exports.corvid = {};
exports.corvid.login =()=>shell.exec("npx corvid login");
exports.corvid.logout =()=>shell.exec("npx corvid logout");

exports.corvid.openEditor =(folderName)=>{
    shell.cd(`./corvid/${folderName}`);
    return shell.exec("npx corvid open-editor");
};
exports.corvid.pull =(folderName)=>{
    shell.cd(`./corvid/${folderName}`);
    return shell.exec("npx corvid pull")
};
exports.corvid.push =(folderName)=>{
    shell.cd(`./corvid/${folderName}`);
    return shell.exec("npx corvid push")
};

exports.corvid.newApp = (folderName, url) =>{
    checkCreateDir("./corvid");
    let cmdCreateApp = `npx create-corvid-app corvid/${folderName} ${url}`;
    return shell.exec(cmdCreateApp);
}

exports.corvid.delete = (folderName) =>{
    return shell.rm("-rf", `./corvid/${folderName}`);
}

exports.corvid.list = () =>{
    return JSON.stringify(getList("corvid"));
}

