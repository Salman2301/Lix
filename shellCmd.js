// refer corvid-cli
const shell = require('shelljs');
const {checkCreateDir, getList} = require("./helper"); // fs are handled by helper module

exports.echo = ()=>shell.exec("echo shelljs is working.");

exports.corvid = {};
exports.corvid.login =()=>shell.exec("npx corvid login");
exports.corvid.logout =()=>shell.exec("npx corvid logout");

exports.corvid.openEditor =(folderName)=>{
    shell.cd(`./corvid/${folderName}`, {silent:true,async:true});
    return shell.exec("npx corvid open-editor", {silent:true,async:true});
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
    return new Promise((req, res)=>{
        checkCreateDir("./corvid");
        let cmdCreateApp = `npx create-corvid-app ./corvid/${folderName} ${url}`;
        let command = shell.exec(cmdCreateApp, {silent:true, async:true});
        console.log("command : " , cmdCreateApp);
        command.stdout.on('data', (data) => {
            console.log("creating :", data);
            /* ... do something with data ... */
        });
        command.stdout.on('finish', () => {
            /* ... do something when finished ... */
            res("completed!");
        });

    });
}

exports.corvid.delete = (folderName) =>{
    return shell.rm("-rf", `./corvid/${folderName}`);
}

exports.corvid.list = () =>{
    return JSON.stringify(getList("corvid"));
}

