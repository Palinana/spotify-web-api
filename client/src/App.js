import React, { Component } from 'react';
import ReactHtmlParser,{ convertNodeToElement } from 'react-html-parser';
import { parse } from 'node-html-parser';
import './App.css';
import axios from 'axios';

import SpotifyWebApi from 'spotify-web-api-js';
const spotifyApi = new SpotifyWebApi();

// parser option
const options = {
  decodeEntities: true,
  transform
};
// Transform <a> into <div>
function transform(node, index) {
  // A node can be modified and passed to the convertNodeToElement function which will continue to render it and it's children
  if (node.type === "tag" && node.name === "a") {
    node.name = "div";
    return convertNodeToElement(node, index, transform);
  }
}

class App extends Component {
  constructor(){
    super();
    const params = this.getHashParams();
    const token = params.access_token;
    if (token) {
      spotifyApi.setAccessToken(token);
    }
    this.state = {
      result: "",
      loggedIn: token ? true : false,
      nowPlaying: { name: 'Not Checked', albumArt: '' },
      accessToken: `client_id=${process.env.REACT_APP_GENIUS_API_CLIENT_KEY}&client_secret=${process.env.REACT_APP_GENIUS_API_CLIENT_SECRET}&access_token=${process.env.REACT_APP_ACCESS_TOKEN}`
    }
  }

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

  getNowPlaying(){
    let artist = '';
    let song = '';

    spotifyApi.getMyCurrentPlaybackState()
      .then((response) => {
        artist = response.item.artists[0].name, 
        song = response.item.name

        this.setState({
          nowPlaying: {
              artist: response.item.artists[0].name, 
              name: response.item.name, 
              albumArt: response.item.album.images[0].url
            }
        });
      })
      .then((response) => {      
        if(artist.length > 1) artist = artist.replace(/\s+/g, '%20').toLowerCase();
    
        // make different requests if sees - in the name; had to remove it
        if(song.indexOf("-") !== -1){
          song = song.substring(0,song.indexOf("-") - 1);
        }
        
        song = song.replace(/\s+/g, '%20').toLowerCase();

        axios.get(`https://api.genius.com/search?q=${artist}%20${song}&client_id=${process.env.REACT_APP_GENIUS_API_CLIENT_KEY}&client_secret=${process.env.REACT_APP_GENIUS_API_CLIENT_SECRET}&access_token=${process.env.REACT_APP_ACCESS_TOKEN}`)
          .then((res) =>{
            let lyricsURL = res.data.response.hits[0].result.url;
            // console.log('RESPONSE', res.data.response.hits[0].result.url);  
            // console.log('artist', artist);  
            // console.log('song', song);
            // console.log('responce', res.data.response);
            // console.log('lyricsURL', lyricsURL);

            axios.get(`https://cors-anywhere.herokuapp.com/` + lyricsURL, {
              headers: {
                'Access-Control-Allow-Origin' : '*',
                'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
              }
            })
              .then((res) => {
                const html = res.data;
                var lyrics = parse(html).querySelector('.lyrics');
                this.setState({result: lyrics})
              }) 
        })
      })
  }
  
  render() {
    return (
      <div className="App">
        <a href='http://localhost:8888' > Login to Spotify </a>
        <div>
          Now Playing: 
          <h2>{ this.state.nowPlaying.artist }</h2>
          <h3>{ this.state.nowPlaying.name }</h3>
        </div>
        <div>
          <img src={this.state.nowPlaying.albumArt} style={{ height: 150 }}/>
        </div>
        { this.state.loggedIn &&
          <button onClick={() => this.getNowPlaying()}>
            Check Now Playing
          </button>
        }
        {
          this.state.result && <div>{ ReactHtmlParser(this.state.result, options) }</div>
        }
      </div>
    );
  }
}

export default App;
