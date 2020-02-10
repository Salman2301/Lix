
const express = require('express');
const {echo, corvid} = require("./shellCmd.js");

const app = express();

echo();

app.get('/corvid/createApp', function (req, res) {
    try {
        const folderName = req.query.folderName;
        const siteUrl = req.query.siteUrl;
        
        if(!folderName && !siteUrl) {
            res.status(400);
            throw new Error("missing required query 'folderName' and 'siteUrl'.");
        }

        if(!folderName) {
            res.status(400);
            throw new Error("missing required query 'folderName'.");
        }
        if(!siteUrl) {
            res.status(400)
            throw new Error("missing required query 'siteUrl'.");
        }
        corvid.newApp(folderName, siteUrl);
        
        res.send('App created!');
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
        const folderName = req.query.folderName;

        if(!folderName) {
            res.status(400);
            throw new Error("missing required query 'folderName'.");
        }
        corvid.pull(folderName);
        res.send('pull')
    } catch (error) {
        console.log("error : " , e);
        res.send({
            errorCode : res.statusCode,
            message : error.message
        })
    }
});

app.get('/corvid/push', function (req, res) {
    try {
        const folderName = req.query.folderName;
        
        if(!folderName) {
            res.status(400);
            throw new Error("missing required query 'folderName'.");
        }
        corvid.push(folderName);
        res.send('push');   
    } catch (error) {
        console.log("error : " , e);
        res.send({
            errorCode : res.statusCode,
            message : error.message
        })
    }
});



app.get('/corvid/login', function (req, res) {
    try {
        corvid.login();
        res.send('log in');
    } catch (error) {
        console.log("error : " , e);
        res.send({
            errorCode : res.statusCode,
            message : error.message
        });
    }
});

app.get('/corvid/logout', function (req, res) {
    try {
        corvid.logout();
        res.send('log out')
    }
    catch(e) {
        console.log("error : " , e);
        res.send({
            errorCode : res.statusCode,
            message : error.message
        });
    }
});


app.listen(8905)
