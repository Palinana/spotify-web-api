/* eslint-disable */

import React, { Component } from 'react';
import ReactHtmlParser,{ convertNodeToElement } from 'react-html-parser';
import axios from 'axios';
import { parse } from 'node-html-parser';
var querystring = require('querystring');



class Login extends Component {
  constructor(){
    super();
    const params = this.getHashParams();
    const token = params.access_token;

    if (token) {
      spotifyApi.setAccessToken(token);
    }

    this.state = {
      previousSong: '',
      error: "",
      result: "",
      loggedIn: token ? true : false,
      nowPlaying: { name: 'Not Checked', albumArt: '' },
      accessToken: `client_id=${process.env.REACT_APP_GENIUS_API_CLIENT_KEY}&client_secret=${process.env.REACT_APP_GENIUS_API_CLIENT_SECRET}&access_token=${process.env.REACT_APP_ACCESS_TOKEN}`
    }
  }

  // componentDidMount() {
  //   axios.get('/login')
  //       .then((res) => {
  //           console.log('ress ', res)
  //       })
  //       .catch(error => console.log('ERROR', error))
  // }


  getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
      q = window.location.hash.substring(1);
    e = r.exec(q)
    while (e) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
      e = r.exec(q);
    }
    return hashParams;
  }

  getLog = async () => {
    const response = await fetch('http://localhost:8888/login');
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    
    return body;
  };

//   getLog() {
//     axios.get(`/login`)
//       .then(resp => {
//         // fetch returns a readable stream, so translate it into stringified HTML
//         console.log('RES ', resp)

//         querystring.parse(this.props.location.hash)
//         console.log('props.location ', querystring.parse(this.props.location.hash))

//         var params = this.getHashParams();

//         var access_token = params.access_token,
//             refresh_token = params.refresh_token,
//             error = params.error;

//         if (error) {
//             alert('There was an error during the authentication');
//         } else {
//             // if (access_token) {
//                 console.log('access_token) ', access_token)
//                 console.log('refresh_token ', refresh_token)
//             // }
//         }

    
//       })
//       .catch(err => {
//         // handle the error
//         console.log('ERR ', err)
//       });
//   }
  

  render() {
   
    return (
      <div className="App">
          <div class="container">
            <div id="login">
                <h1>This is an example of the Authorization Code flow</h1>
                <button onClick={() => this.getLog()}>Log in with Spotify</button>
            </div>
            <div id="loggedin">
                <div id="user-profile">
                </div>
                <div id="oauth">
                </div>
                <button class="btn btn-default" id="obtain-new-token">Obtain new token using the refresh token</button>
            </div>
            </div>
      </div>
    );
  }
}

export default Login;
