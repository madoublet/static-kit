var express = require('express'),
	session = require('express-session'),
	path = require('path'),
	url  = require('url'),
	passport = require('passport'),
	GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
	
// routes
var pages = require('./routes/pages'),
    images = require('./routes/images'),
    auth = require('./routes/auth');
	
var exports = module.exports = {};  

 /**
  * Setup authorization for the app
  * @param {Object} app
  */
exports.setupAuth = function(app, config){
    
    // setup client IDs	
    var GOOGLE_CLIENT_ID = config.google.clientId;
    var GOOGLE_CLIENT_SECRET = config.google.clientSecret;
    
    // setup session
    app.use(session({
      resave: false,
      saveUninitialized: true,
      secret: 'hashedit is cool'
    }));
    
    // setup passport session  
    passport.serializeUser(function(user, done) {
      done(null, user);
    });
    
    passport.deserializeUser(function(obj, done) {
      done(null, obj);
    });
    
    // setup google auth
    app.use(passport.initialize());
    app.use(passport.session());
    
    // setup google strategy
    passport.use(new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: config.app.url + "/auth/google/callback"
      },
      function(token, tokenSecret, profile, done) {
    	
        // set email and provider
        var emails = profile.emails;
        var provider = profile.provider;
        var isAuthorized = false;
        
        // check email/provider against authorized list
        for(x=0; x<emails.length; x++){
        	var email = emails[x].value;
        	
        	for(y=0; y<config.authorized.length; y++){
          	
          	    // check authorization
          	    if(config.authorized[y].email == email && config.authorized[y].provider == provider){
              	    isAuthorized = true;
          	    }
          		
        	}
        	
        }
        
        if(isAuthorized){
          	console.log('Authorized!!!');
          	return done(null, profile);
        }
        else{
          	console.log('Not Authorized!!!');
          	return done(null, false, {message: 'Not authorized'});
        }
        
      }
    ));
    
    /**
      * Route for Google Auth
      * @param {Object} req - http://expressjs.com/api.html#req
      * @param {Object} res - http://expressjs.com/api.html#res
      */
    app.get('/auth/google', 
      function(req, res, next){ // middleware to save off where the auth request came from
    	  
    	  // get parts
    	  var parts = url.parse(req.headers.referer);
    	  
    	  // get pathname
    	  req.session.pathToFile = parts.pathname;
    	  
    	  // set lastUrl to request url, then authenticate
    	  req.session.lastUrl = req.headers.referer;
    	  
    	  next();
    	  
      },
      passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.profile.emails.read'] }),
      function(req, res) {
    	
      });
    
    /**
      * Callback from Google authentication
      * @param {Object} req - http://expressjs.com/api.html#req
      * @param {Object} res - http://expressjs.com/api.html#res
      */
    app.get('/auth/google/callback', 
      passport.authenticate('google', { failureRedirect: '/login' }),
      function(req, res) {
    	
        if(req.session.lastUrl) {
        	res.redirect(req.session.lastUrl + '#edit');
        }
        else{
        	res.redirect('/');
        }
    	
      });
    
    /**
      * Logs the user out
      * @param {Object} req - http://expressjs.com/api.html#req
      * @param {Object} res - http://expressjs.com/api.html#res
      */
    app.get('/logout', function(req, res){
      
      req.logout();
      
      if(req.session.lastUrl) {
      	res.redirect(req.session.lastUrl);
      }
      else{
      	res.redirect('/');
      }
      
    });
    
}

 /**
  * Setup routes for the app
  * @param {Object} app
  */
exports.setupRoutes = function(app){
    
    // external routes
    app.use('/api/pages', pages);
    app.use('/api/images', images);
    app.use('/api/auth', auth);
    
}