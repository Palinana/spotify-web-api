const express = require('express');
const PORT = 8888;
const path = require('path');
const bodyParser = require('body-parser');
const morgan = require('morgan');
var request = require('request'); 
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var cors = require('cors');

require('dotenv').config();
var redirect_uri = 'http://localhost:8888/callback'; 
var client_id = 'bce8800b1c4c4e08a7f846d654ededbd';
var client_secret = 'b0a731b38305483ea380b382399da5f7';
  
/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };
  
var stateKey = 'spotify_auth_state';
  
var app = express();

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'));
    app.use(express.static('server/public/index.html'));
    
} else {
    // app.use(express.static(__dirname + '/public'))
    //   .use(cors()) 
    //   .use(cookieParser());

    // app.get('*', (req, res, next) => {
    //   res.sendFile(path.join(__dirname, '../client/public/index.html'));
    // });
    // app.get('/', function(req, res) {
    //     res.sendFile(path.join(__dirname + '/index.html'));
    // });

    // Serve any static files
    app.use(express.static(path.join(__dirname, 'client/build')));

    // Handle React routing, return all requests to React app
    // app.get('*', function(req, res) {
    //   res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    // });
    app.get('/', function(req, res) {
        res.sendFile(path.join(__dirname + 'index.html'));
    });
    
    // app.use(express.static(path.join(__dirname, '../public')));

    // app.get('*', (req, res, next) => {
    //   res.sendFile(path.join(__dirname, '../client/public/index.html'));
    // });
    // app.get("/", (req, res) => {
    //     res.status(200).sendFile(path.resolve(__dirname, "public", "index.html"));
    // });
    // app.use('*', (req, res, next) => {
    //   res.sendFile(path.join(__dirname, '../client/public/index.html'));
    // });
  
    app.use((err, req, res, next) => {
      console.error(err);
      console.error(err.stack);
      res.status(err.status || 500).send(err.message || 'Internal server error!');
    });
  }

app.get('/login', function(req, res) {
    console.log('in here now ')
    var state = generateRandomString(16);
    res.cookie(stateKey, state);
  
    // your application requests authorization
    var scope = 'user-read-private user-read-email user-read-playback-state';

    res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state
      }));
});

app.get('/callback', function(req, res) {
    console.log('redirected here ')
    // your application requests refresh and access tokens
    // after checking the state parameter
  
    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;
  
    if (state === null || state !== storedState) {
      res.redirect('/#' +
        querystring.stringify({
          error: 'state_mismatch'
        }));
    } else {
      res.clearCookie(stateKey);
      var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
          code: code,
          redirect_uri: redirect_uri,
          grant_type: 'authorization_code'
        },
        headers: {
          'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
        },
        json: true
      };
  
      request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
  
          var access_token = body.access_token,
              refresh_token = body.refresh_token;
        console.log('access_token !! ', access_token);
          var options = {
            url: 'https://api.spotify.com/v1/me',
            headers: { 'Authorization': 'Bearer ' + access_token },
            json: true
          };
  
          // use the access token to access the Spotify Web API
          request.get(options, function(error, response, body) {
            console.log(body);
          });
          console.log('refresh_token here !! ', refresh_token);
          // we can also pass the token to the browser to make requests from there
          res.redirect('http://localhost:3000/#' +
            querystring.stringify({
              access_token: access_token,
              refresh_token: refresh_token
            }));
        } else {
          res.redirect('/#' +
            querystring.stringify({
              error: 'invalid_token'
            }));
        }
      });
    }
  });
  
  app.get('/refresh_token', function(req, res) {
    console.log('finally with refresh_token here !! ', refresh_token);
    // requesting access token from refresh token
    var refresh_token = req.query.refresh_token;
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
      form: {
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      },
      json: true
    };
  
    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token;
        res.send({
          'access_token': access_token
        });
      }
    });
  });
  

app.listen(process.env.PORT || PORT, () => {
    console.log(`listening on PORT ${PORT}`);
});

module.exports = app;
