var express = require('express');
var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');
var router = express.Router();
var mkdirp = require('mkdirp');
var readdirp = require('readdirp');

/**
  * Lists pages
  * @param {Object} req - http://expressjs.com/api.html#req
  * @param {Object} res - http://expressjs.com/api.html#res
  * @param {Object} next - required for middleware
  */
router.get('/list', function(req, res, next) {
    
  if(req.user){
    
    readdirp({ root: 'public', fileFilter: ['*.html', '*.htm'], directoryFilter: ['!hashedit', '!images', '!js', '!node_modules', '!bower_components'] }
        , function(fileInfo) { 
          // do something with file entry here
        } 
        , function (err, result) {
          
          // clean up list
          var list = [];
          
          for(x=0; x<result.files.length; x++){
            list.push(result.files[x].path);
          }
          
          res.setHeader('Content-Type', 'application/json');
          res.status(200).send(JSON.stringify(list));
        });
    
  }
  else{
    res.sendStatus(401);
  }
    
  
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
  
    var file = 'public/' + params.url;
    
    
    // get directory from path
    var dir = path.dirname(file);
    
    
    mkdirp(dir, function (err) {
        if (err) {
          console.error(err)
        }
        else{
        
          // write file
          fs.writeFile(file, 'Hello Node.js', function (err) {
            if (err) {
              throw err;
            }
            
            console.log('It\'s saved!');
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
  
  if(req.user && req.session.pathToFile){
  
    var pathToFile = 'public' + req.session.pathToFile;
    
    console.log(pathToFile);
   
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
            
            console.log('Saved!');
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
  * Edits a page
  * @param {Object} req - http://expressjs.com/api.html#req
  * @param {Object} res - http://expressjs.com/api.html#res
  * @param {Object} next - required for middleware
  */
router.get('/retrieve', function(req, res, next) {
  
  if(req.user && req.session.pathToFile){
  
    var pathToFile = 'public' + req.session.pathToFile;
   
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
