var http = require('http');
var fs = require('fs');
var sys = require('util');
var qs = require('querystring');
var port = process.env.PORT || 8080;
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var dbUrl = 'mongodb://<dbuser>:<dbpassword>@ds041150.mlab.com:41150/heroku_nw56swbz';

/*
==================================================
http.createServer
==================================================
*/
var server = http.createServer(function (req, res) {
  /* control for favicon */
  if (req.url === '/favicon.ico') {
    res.writeHead(200, {'Content-Type': 'image/x-icon'} );
    res.end();
    return;
  }

  /* get post data */
  var headers = req.headers;
  var method = req.method;
  var url = req.url;
  var body = [];
  req.on('error', function(err) {
    console.error(err);
  }).on('data', function(data) {
    /*
    console.log('========== on 'data' callback response: ==========');
    console.log(data);
    // */
    body += data;
  }).on('end', function() {
    var postdata =  qs.parse(body);
    /*
    console.log('> postdata: ', postdata);
    console.log('> headers: ', headers);
    console.log('> method: ', method );
    console.log('> url: ', url);
    console.log('> body: ', body);
    // */

  /* render views function */
  var renderView = function(file) {
    fs.readFile(file, function (error, data) {
        if (error) {
            res.writeHead(404);
            res.write('404 error.');
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(data);
          }
        res.end();
    });
  }

  /* render error view */
  var errorView = function() {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('That resource does not exist.');
    res.end();
  }

  /*
    ==================================================
    ROUTES - use switch to define routes
    ==================================================
  */
  switch(url) {
    /*
     ==================================================
     login page
     ==================================================
    */
    case '/':
      console.log( '/ route called');
      if (req.url === '/') {
        renderView('./views/login.html');
      } else {
        errorView();
      }
      break;

    case '/login':
      console.log( '/ route called');
      if (req.url === '/login') {
        renderView('./views/login.html');
      }
      break;

    /*
      ==================================================
      main route with NO encryption
      ==================================================
    */
    case '/main':
      console.log( '/main route called');
      /* query db if username & password exist in request */
      if (req.url === "/main" && postdata.username && postdata.password) {
        MongoClient.connect(dbUrl, function(err, db) {
          assert.equal(null, err);
          var login = function(userpassword) {
            console.log('login() called');
            db.collection('users').findOne({username: postdata.username}, function (err, result) {
              if (err) {
                console.log(err);
              } else if (!result) {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write('Username not found. <a href="login">Please click here to try again.</a>');
                res.end();
              } else if (postdata.password == result.password) {
                  renderView('./views/main.html');
              } else if (postdata.password != result.password) {
                  res.writeHead(200, { 'Content-Type': 'text/html' });
                  res.write('Password incorrect. <a href="login">Please click here to try again.</a>');
                  res.end();
              }
              db.close();
            });
          }
          login(postdata.password);
        });
    } else if (req.url === "/main" && postdata.userToken == 'loggedIn') {
      renderView('./views/main.html');
    }
    else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write('You must log in to search and create configurations. <a href="login">Please click here to login.</a>');
        res.end();
    }
    break;

    /*
      ==================================================
      show configurations
      ==================================================
    */
    case '/show-configurations':
      console.log('/show-configurations route called');
      if (req.url === '/show-configurations') {
        MongoClient.connect(dbUrl, function(err, db) {
          assert.equal(null, err);
          console.log("Connected successfully to db");
          var findDocuments = function(db, callback) {
            var collection = db.collection('configurations');
            collection.find({}).toArray(function(err, docs) {
              assert.equal(err, null);
              console.log("Found the following records");
              console.log(docs)
              callback(docs);
            });
          }
          findDocuments(db, function() {
            db.close();
          });
        });
        renderView('./views/configurations.html');
      } else {
        errorView();
      }
      break;

    /*
      ==================================================
      create configuration
      ==================================================
    */
    case '/configuration-added':
      console.log('/configuration-added route called');
      if (req.url === '/configuration-added') {
        MongoClient.connect(dbUrl, function(err, db) {
          assert.equal(null, err);
          console.log("Connected successfully to db");
          var nameInput = postdata.name;
          var hostnameInput = postdata.hostname;
          var portInput = postdata.port;
          var usernameInput = postdata.username;
          /*
          console.log('> nameInput: ', nameInput);
          console.log('> hostnameInput: ', hostnameInput);
          console.log('> portInput: ', portInput);
          console.log('> usernameInput: ', usernameInput);
          // */
          var addConfiguration = function(db, callback) {
            var collection = db.collection('configurations');
            collection.insertMany([
              {name: nameInput, hostname: hostnameInput, port: portInput, username: usernameInput}
            ], function(err, result) {
              assert.equal(err, null);
              console.log("Inserted configuration into the collection");
              callback(result);
            });
          }
          addConfiguration(db, function() {
              db.close();
            });
        });
        renderView('./views/configuration-added.html');
      } else {
        errorView();
      }
      break;

      /*
        ==================================================
        delete configuration
        ==================================================
      */

      /*
        ==================================================
        modify configuration
        ==================================================
      */

      /*
        ==================================================
        /logout route
        ==================================================
      */
      case '/logout':
        console.log( '/logout route called');
        renderView('./views/logout.html');
        break;
    } /* ========== end switch cases  ========== */

  }); /* ========== end req.on('end') ========== */

}); /* ========== end http:createServer ========== */

server.listen(port);
console.log('Server listening on ' + port);
