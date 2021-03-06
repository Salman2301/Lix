
const express = require('express');
const cors = require('cors');

const {echo, corvid} = require("./shellCmd.js"); // shell scripts are handled by shellCmd module

const app = express();
app.use(cors());
app.options('*', cors());
let allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Headers', "*");
    next();
  }
  app.use(allowCrossDomain);

echo();

app.get('/corvid/createApp', async function (req, res) {
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

        await corvid.newApp(folderName, siteUrl);
        
        res.send(JSON.stringify({
            status : "OK",
            msg : "App created!"
        }));
    } catch (error) {
        console.log("error : " , error);
        res.send({
            errorCode : res.statusCode,
            message : error.message
        })
    }
});


app.get('/corvid/openEditor', function (req, res) {
    try {
        const folderName = req.query.folderName;

        if(!folderName) {
            res.status(400);
            throw new Error("missing required query 'folderName'.");
        }
        corvid.openEditor(folderName);
        res.send(JSON.stringify({
            status : "OK",
            msg : "Editor opened!"
        }));
    } catch (error) {
        console.log("error : " , error);
        res.send({
            errorCode : res.statusCode,
            message : error.message
        });
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
        res.send(JSON.stringify({
            status : "OK",
            msg : "pull"
        }));
    } catch (error) {
        console.log("error : " , error);
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
        res.send(JSON.stringify({
            status : "OK",
            msg : "push"
        }));
    } catch (error) {
        console.log("error : " , error);
        res.send({
            errorCode : res.statusCode,
            message : error.message
        })
    }
});



app.get('/corvid/login', function (req, res) {
    try {

        corvid.login();
        res.send(JSON.stringify({
            status : "OK",
            msg : "log in"
        }));
    } catch (error) {
        console.log("error : " , error);
        res.send({
            errorCode : res.statusCode,
            message : error.message
        });
    }
});

app.get('/corvid/logout', function (req, res) {
    try {
        corvid.logout();
        res.send(JSON.stringify({
            status : "OK",
            msg : "log out"
        }));
    }
    catch(error) {
        console.log("error : " , error);
        res.send({
            errorCode : res.statusCode,
            message : error.message
        });
    }
});


app.get('/corvid/delete', function (req, res) {
    try {
        const folderName = req.query.folderName;
        
        if(!folderName) {
            res.status(400);
            throw new Error("missing required query 'folderName'.");
        }
        corvid.delete(folderName);
        res.send(JSON.stringify({
            status : "OK",
            msg : "deleted"
        }));
    }
    catch(error) {
        console.log("error : " , error);
        res.send({
            errorCode : res.statusCode,
            message : error.message
        });
    }
});

app.get('/corvid/list', function (req, res) {
    try {
        let jsonStr = corvid.list();
        res.header("Content-Type",'application/json');
        res.send(jsonStr);
    }
    catch(error) {
        console.log("error : " , error);
        res.send({
            errorCode : res.statusCode,
            message : error.message
        });
    }
});


app.listen(8905)
