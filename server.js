const shell = require('shelljs');
const express = require('express');
const {echo, corvidNewApp, openEditor ,login, logout} = require("./shellCmd.js");

const app = express();

app.get('/corvid/createApp', function (req, res) {
    try {
        const folderName = req.query.folderName;
        const siteUrl = req.query.siteUrl;
        
        if(!folderName && !siteUrl) {
            res.status(400);
            throw new Error("missing required query 'folderName' and 'siteUrl'.");
            // return;
        }
        console.log("am i running?" , req.query);
        if(!folderName) {
            res.status(400);
            throw new Error("missing required query 'folderName'.");
        }
        if(!siteUrl) {
            res.status(400)
            throw new Error("missing required query 'siteUrl'.");
        }
        
        shell.exec(corvidNewApp(folderName , siteUrl));
        res.send('Hello World');
    } catch (error) {
        console.log("error : " , error);
        res.send({
            errorCode : res.statusCode,
            message : error.message
        })
    }
});


app.get('/corvid/pull', function (req, res) {
    try {
        shell.exec(pull);
        res.send('pull')
    } catch (error) {
        console.log("error : " , e);
    }
});


app.get('/corvid/push', function (req, res) {
    try {
       shell.exec(push);
       res.send('push');   
    } catch (error) {
        console.log("error : " , e);
    }
});



app.get('/corvid/login', function (req, res) {
    try {
        shell.exec(login);
        res.send('log in');
    } catch (error) {
        console.log("error : " , e);
    }
});

app.get('/corvid/logout', function (req, res) {
    try {
        shell.exec(logout);
        res.send('log out')
    }
    catch(e) {
        console.log("error : " , e);

    }
});

app.listen(8905)
