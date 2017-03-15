var http = require('http');
var fs = require('fs');
var path = require('path');
var sys = require('util');
var qs = require('querystring');
var port = process.env.PORT || 8080;
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
if (port == 8080) {
    var dbUrl = 'mongodb://localhost:27017/nessusdb'
} else {
    var dbUrl = 'mongodb://heroku_nw56swbz:9312qvb35fi9njhj2hclhjgfod@ds041150.mlab.com:41150/heroku_nw56swbz';
}

/*
==================================================
http.createServer
==================================================
*/
var server = http.createServer(function(req, res) {
    var url = req.url;
    var filePath = '.' + url;
    var headers = req.headers;
    var method = req.method;
    var params = req.params;
    var query = req.query;
    var body = [];
    var extname = String(path.extname(filePath)).toLowerCase();
    var contentType = 'text/html';
    var mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.ico': 'image/x-icon',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.svg': 'application/image/svg+xml'
    };

    contentType = mimeTypes[extname]

    req.on('error', function(err) {
        console.error(err);
    }).on('data', function(data) {
        body += data;
    }).on('end', function() {
        var configName = url.slice(20);
        var postdata = qs.parse(body);

        /* render public function */
        function renderData(filePath) {
            fs.readFile(filePath, function(error, data) {
                if (error) {
                    res.writeHead(404);
                    res.end();
                } else {
                    res.writeHead(200, {
                        'Content-Type': contentType
                    });
                    res.end(data);
                }
            });
        }

        /* render error view */
        function errorView() {
            res.writeHead(200, {
                'Content-Type': contentType
            });
            res.end('That resource does not exist.');
        }

        /*
          ==================================================
          ROUTES - use switch to define routes
          ==================================================
        */
        switch (url) {
            /*
             ==================================================
             load favicon
             ==================================================
            */
            case '/favicon.ico':
                console.log('/favicon.ico called');
                if (url === '/favicon.ico') {
                    renderData('./favicon.ico');
                } else {
                    errorView();
                }
                break;

            case '/style.css':
                console.log(url + ' called');
                if (url === '/style.css') {
                    renderData('./public/css/style.css');
                }
                break;

            case '/configurations.js':
                console.log(url + ' called');
                if (url === '/configurations.js') {
                    renderData('./public/js/configurations.js');
                }
                break;

            case '/edit-configuration.js':
                console.log(url + ' called');
                if (url === '/edit-configuration.js') {
                    renderData('./public/js/edit-configuration.js');
                }
                break;

            /*
             ==================================================
             login
             ==================================================
            */
            case '/':
                console.log('/ route called');
                if (url === '/') {
                    renderData('./public/html/login.html');
                } else {
                    errorView();
                }
                break;

            case '/login':
                console.log('/login route called');
                if (url === '/login') {
                    renderData('./public/html/login.html');
                } else {
                    errorView();
                }
                break;

            /*
              ==================================================
              /logout
              ==================================================
            */
            case '/logged-out':
                console.log('/logged-out route called');
                if (url === '/logged-out') {
                    renderData('./public/html/logged-out.html');
                } else {
                    errorView();
                }
                break;

            /*
              ==================================================
              home route with NO encryption
              ==================================================
            */
            case '/configurations':
                console.log('/configurations route called');
                if (url === "/configurations" && postdata.username && postdata.password) {
                    MongoClient.connect(dbUrl, function(err, db) {
                        assert.equal(null, err);
                        var login = function(userpassword) {
                            db.collection('users').findOne({
                                username: postdata.username
                            }, function(err, result) {
                                if (err) {
                                    console.log(err);
                                } else if (!result) {
                                    res.writeHead(200, {
                                        'Content-Type': 'text/html'
                                    });
                                    res.write('Username not found. <a href="login">Please click here to try again.</a>');
                                    res.end();
                                } else if (userpassword == result.password) {
                                    fs.readFile('./public/html/configurations.html', function(error, data) {
                                        if (error) {
                                            res.writeHead(404);
                                            res.end();
                                        } else {
                                            res.writeHead(200, {
                                                'Content-Type': contentType
                                            });
                                            res.end(data);
                                            // res.end();
                                        }
                                    });
                                } else if (userpassword != result.password) {
                                    res.writeHead(200, {
                                        'Content-Type': 'text/html'
                                    });
                                    res.write('Password incorrect. <a href="login">Please click here to try again.</a>');
                                    res.end();
                                }
                                db.close();
                            });
                        }
                        login(postdata.password);
                    });
                } else if (url === "/configurations" && postdata.userToken == 'loggedIn') {
                    renderData('./public/html/configurations.html');
                } else {
                    res.writeHead(200, {
                        'Content-Type': 'text/html'
                    });
                    res.write('You must log in to search and create configurations. <a href="login">Please click here to login.</a>');
                    res.end();
                }
                break;

            /*
              ==================================================
              REST API endpoints
              ==================================================
            */
            case '/api/configurations':
                console.log('/api/configurations route called');
                if (url === '/api/configurations') {
                    MongoClient.connect(dbUrl, function(err, db) {
                        assert.equal(null, err);
                        console.log("Connected successfully to db");
                        var findDocuments = function(db, callback) {
                            var collection = db.collection('configurations');
                            // var options = {
                            //     "limit": 10,
                            //     "skip": 0
                            // };
                            collection.find({}).toArray(function(err, docs) {
                                assert.equal(err, null);
                                console.log("Found the following records");
                                console.log(docs)
                                callback(docs);
                                res.writeHead(200, {
                                    "Content-Type": "application/json"
                                });
                                res.end('configurations retrieved from database.');
                            });
                        }
                        findDocuments(db, function(data) {
                            var configData = JSON.stringify(data);
                            console.log("Number of results: ", data.length);
                            res.end(configData);
                            db.close();
                        });
                    });
                }
                break;

            case '/api/configurations/' + configName:
                console.log('/api/configurations/:name route called');
                if (url === '/api/configurations/' + configName) {
                    MongoClient.connect(dbUrl, function(err, db) {
                        assert.equal(null, err);
                        console.log("Connected successfully to db");
                        var findDocuments = function(db, callback) {
                            var collection = db.collection('configurations');
                            collection.find({"name":configName}).toArray(function(err, docs) {
                                assert.equal(err, null);
                                console.log("Found the following records");
                                console.log(docs)
                                callback(docs);
                                res.writeHead(200, {
                                    "Content-Type": "application/json"
                                });
                                res.end('configurations retrieved from database.');
                            });
                        }
                        findDocuments(db, function(data) {
                            var configData = JSON.stringify(data);
                            res.end(configData);
                            db.close();
                        });
                    });
                }
                break;

            /*
              ==================================================
              create configuration
              ==================================================
            */
            case '/add-configuration':
                console.log('/add-configuration route called');
                if (url === '/add-configuration') {
                    renderData('./public/html/add-configuration.html');
                } else {
                    errorView();
                }
                break;

            case '/configuration-added':
                console.log('/configuration-added route called');
                if (url === '/configuration-added') {
                    MongoClient.connect(dbUrl, function(err, db) {
                        assert.equal(null, err);
                        console.log("Connected successfully to db");
                        var nameInput = postdata.name;
                        var hostnameInput = postdata.hostname;
                        var portInput = postdata.port;
                        var usernameInput = postdata.username;
                        var addConfiguration = function(db, callback) {
                            var collection = db.collection('configurations');
                            collection.insertMany([{
                                name: nameInput,
                                hostname: hostnameInput,
                                port: portInput,
                                username: usernameInput
                            }], function(err, result) {
                                assert.equal(err, null);
                                console.log("Inserted configuration into the collection");
                                callback(result);
                            });
                        }
                        addConfiguration(db, function() {
                            db.close();
                        });
                     });
                    renderData('./public/html/configuration-added.html');
                } else {
                    errorView();
                }
                break;

            /*
              ==================================================
              delete configuration
              ==================================================
            */
            case '/configuration-deleted':
                console.log('/configuration-deleted route called');
                if (url === '/configuration-deleted') {
                    MongoClient.connect(dbUrl, function(err, db) {
                        assert.equal(null, err);
                        console.log("Connected successfully to db");
                        var nameInput = postdata.name;
                        var deleteConfiguration = function(db, callback) {
                            var collection = db.collection('configurations');
                            collection.findAndRemove({
                                name: nameInput
                            }, function(err, result) {
                                assert.equal(err, null);
                                console.log("Deleted configuration from the collection");
                                callback(result);
                            });
                        }
                        deleteConfiguration(db, function() {
                            db.close();
                        });
                     });
                    renderData('./public/html/configuration-deleted.html');
                } else {
                    errorView();
                }
                break;

            /*
              ==================================================
              modify configuration
              ==================================================
            */
            case '/edit-configuration/' + postdata.name:
                console.log('/edit-configuration/:name route called');
                if (url === '/edit-configuration/' + postdata.name) {
                    renderData('./public/html/edit-configuration.html');
                } else {
                    errorView();
                }
                break;

                case '/configuration-saved':
                    console.log('/configuration-saved route called');
                    if (url === '/configuration-saved') {
                        MongoClient.connect(dbUrl, function(err, db) {
                            assert.equal(null, err);
                            console.log("Connected successfully to db");
                            var oldNameInput = postdata.oldName;
                            var nameInput = postdata.name;
                            var hostnameInput = postdata.hostname;
                            var portInput = postdata.port;
                            var usernameInput = postdata.username;
                            var saveConfiguration = function(db, callback) {
                                var collection = db.collection('configurations');
                                collection.updateOne({name: oldNameInput}, {$set: {name: nameInput, hostname: hostnameInput, port: portInput, username: usernameInput}}, function(err, result) {
                                    assert.equal(err, null);
                                    console.log("Saved configuration.");
                                    callback(result);
                                });
                            }
                            saveConfiguration(db, function() {
                                db.close();
                            });
                         });
                        renderData('./public/html/configuration-saved.html');
                    } else {
                        errorView();
                    }
                    break;

        } /* ========== end switch cases  ========== */

    }); /* ========== end req.on('end') ========== */
}); /* ========== end http:createServer ========== */

server.listen(port);
console.log('Server listening on ' + port);
