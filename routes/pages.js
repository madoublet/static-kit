var express = require('express');
var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');
var router = express.Router();
var mkdirp = require('mkdirp');
var url  = require('url');
var readdirp = require('readdirp');

/**
  * Lists pages
  * @param {Object} req - http://expressjs.com/api.html#req
  * @param {Object} res - http://expressjs.com/api.html#res
  * @param {Object} next - required for middleware
  */
router.get('/list', function(req, res, next) {

    readdirp({ root: 'public', fileFilter: ['*.html', '*.htm'], directoryFilter: ['!hashedit', '!images', '!js', '!node_modules', '!bower_components'] }
        , function(fileInfo) {
          // do something with file entry here
        }
        , function (err, result) {

          // clean up list
          var list = [];

          for(x=0; x<result.files.length; x++){
            list.push('/' + result.files[x].path);
          }

          res.setHeader('Content-Type', 'application/json');
          res.status(200).send(JSON.stringify(list));
        });

});

/**
  * Lists path
  * @param {Object} req - http://expressjs.com/api.html#req
  * @param {Object} res - http://expressjs.com/api.html#res
  * @param {Object} next - required for middleware
  */
router.get('/path/list', function(req, res, next) {

    readdirp({ root: 'public', fileFilter: ['*.html', '*.htm'], directoryFilter: ['!hashedit', '!images', '!js', '!node_modules', '!bower_components'] }
        , function(fileInfo) {
          // do something with file entry here
        }
        , function (err, result) {

          // clean up list
          var list = [];

          for(x=0; x<result.files.length; x++){
            var str = path.dirname('/' + result.files[x].path);

            if(list.indexOf(str) == -1){
              list.push(str);
            }

          }

          res.setHeader('Content-Type', 'application/json');
          res.status(200).send(JSON.stringify(list));
        });

    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify(list));

});

/**
  * Adds a page
  * @param {Object} req - http://expressjs.com/api.html#req
  * @param {Object} res - http://expressjs.com/api.html#res
  * @param {Object} next - required for middleware
  */
router.post('/add', function(req, res, next) {

  if(req.user){

    var params = req.body;
    var url = params.url;
    var title = params.title;
    var description = params.description;


    if (url && url.charAt(0)==='/') {
        url = url.slice(1);
    }

    var file = 'public/' + url;
    var defaultFile = 'public/.default.html';


    // get directory from path
    var dir = path.dirname(file);

    mkdirp(dir, function (err) {
        if (err) {
          console.error(err)
        }
        else{

            // read file
            fs.readFile(defaultFile, function (err, html) {

                if (err) {
                  throw err;
                }
                else{

                  $ = cheerio.load(html);

                  $('title').html(title);
                  $('meta[name=description]').attr('content', description);

                  // write file
                  fs.writeFile(file, $.html(), function (err) {
                    if (err) {
                      throw err;
                    }

                    console.log('[Hashedit] File created at: ' + file);
                  });

                }
            });

        }

    });

    // send success
    res.sendStatus(200);
  }
  else{
    res.sendStatus(401);
  }

});


/**
  * Edits a page
  * @param {Object} req - http://expressjs.com/api.html#req
  * @param {Object} res - http://expressjs.com/api.html#res
  * @param {Object} next - required for middleware
  */
router.post('/save', function(req, res, next) {

  // get parts
  var parts = url.parse(req.headers.referer);

  // get pathname
  var pathToFile = parts.pathname;

  if(req.user && pathToFile){

    pathToFile = 'public' + pathToFile;

    if(req.body){

      // read file
      fs.readFile(pathToFile, function (err, html) {

        if (err) {
          throw err;
        }
        else{

          // load html
          $ = cheerio.load(html);

          // walk through changes
          var changes = req.body;

          for(var x=0; x<changes.length; x++){

            var selector = changes[x].selector;
            var html = changes[x].html;

            // set html to new html
            $(selector).html(html);

          }

          // write changes
          fs.writeFile(pathToFile, $.html(), function (err) {
            if (err) {
              throw err;
            }

            console.log('[Hashedit] Content Saved!');
          });



        }

      });


    }
    else{
      res.sendStatus(400);
    }

    // send success
    res.sendStatus(200);
  }
  else{
    res.sendStatus(401);
  }

});

/**
  * Apply page settings
  * @param {Object} req - http://expressjs.com/api.html#req
  * @param {Object} res - http://expressjs.com/api.html#res
  * @param {Object} next - required for middleware
  */
router.post('/settings', function(req, res, next) {

  // get parts
  var parts = url.parse(req.headers.referer);

  var params = req.body;
  var title = params.title;
  var description = params.description;

  // get pathname
  var pathToFile = parts.pathname;

  if(req.user && pathToFile){

    pathToFile = 'public' + pathToFile;

    if(req.body){

      // read file
      fs.readFile(pathToFile, function (err, html) {

        if (err) {
          throw err;
        }
        else{

          // load html
          $ = cheerio.load(html);

          $('title').html(title);
          $('meta[name=description]').attr('content', description);

          // write changes
          fs.writeFile(pathToFile, $.html(), function (err) {
            if (err) {
              throw err;
            }

            console.log('[Hashedit] Settings Saved!');
          });



        }

      });


    }
    else{
      res.sendStatus(400);
    }

    // send success
    res.sendStatus(200);
  }
  else{
    res.sendStatus(401);
  }

});

/**
  * Retrieves a page
  * @param {Object} req - http://expressjs.com/api.html#req
  * @param {Object} res - http://expressjs.com/api.html#res
  * @param {Object} next - required for middleware
  */
router.get('/retrieve', function(req, res, next) {

  // get parts
  var parts = url.parse(req.headers.referer);

  // get pathname
  var pathToFile = parts.pathname;

  if(pathToFile){

    pathToFile = 'public' + pathToFile;

    // read file
    fs.readFile(pathToFile, function (err, html) {

      if (err) {
        throw err;
      }
      else{
        res.send(html);
      }

    });

  }
  else{
    res.sendStatus(401);
  }

});


module.exports = router;
