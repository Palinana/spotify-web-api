import React, { Component } from 'react';
import ReactHtmlParser,{ convertNodeToElement } from 'react-html-parser';
import axios from 'axios';
import { parse } from 'node-html-parser';
import './App.css';

import { getAverageRGB } from './image';
import logo from './logo.svg';

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
      error: "",
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
              albumArt: response.item.album.images[0].url,
              error: ""
            }
        });
      })
      .then((response) => {      
        if(artist.length > 1) {
          // removing special characters
          artist = artist.replace(/[\/\\#+$✝~%*<>{}]/g, '');
          // replacing artist spaces with %20
          artist = artist.replace(/\s+/g, '%20').toLowerCase();
        }
    
        // make different requests if sees - in the name; had to remove it
        if(song.indexOf("-") !== -1){
          // cutting string
          song = song.substring(0, song.indexOf("-") - 1);
        }

        if (song.indexOf("(") !== -1 || song.indexOf("/") !== -1 ) {
          // cutting string 
          if (song.indexOf("/") !== -1) {            
            let ind = song.indexOf("/"); //saving index
            if (song[ind-1] === ' ') {
              song = song.slice(0, song.indexOf("/")-1); //cutting if there is a space
            }
            else {
              song = song.slice(0, song.indexOf("/")+1) //cutting without a space
            };
          }
          if (song.indexOf("(") !== -1){
            let ind = song.indexOf("("); //saving index
            if (song[ind-1] === ' ') {
              song = song.slice(0, song.indexOf("(")-1); //cutting if there is a space
            }
            else {
              song = song.slice(0, song.indexOf("(")+1) //cutting without a space
            };
          }
        }
        
        // replacing song spaces with %20
        song = song.replace(/\s+/g, '%20').toLowerCase();

        axios.get(`https://api.genius.com/search?q=${artist}%20${song}&client_id=${process.env.REACT_APP_GENIUS_API_CLIENT_KEY}&client_secret=${process.env.REACT_APP_GENIUS_API_CLIENT_SECRET}&access_token=${process.env.REACT_APP_ACCESS_TOKEN}`)
          .then((res) =>{
            let lyricsURL = res.data.response.hits[0].result.url;
            console.log('RESPONSE', res.data.response);  
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
                let lyrics;
                let index;
                let wordInSong;
                let splittedURL = lyricsURL.split("-"); // making an array from url 

                if(song.indexOf("%") !== -1) { // true
                  index = song.lastIndexOf("%");
                  wordInSong = song.slice(index+3).replace(/[\/\\']/g, '');
                }
                else {
                  index = song.length+1;
                  wordInSong = song.slice(0, index).replace(/[\/\\']/g, '');
                }

                console.log('splittedURL ', splittedURL)
                console.log('wordInSong ', wordInSong)
                console.log('splittedURL.includes(wordInSong) ', splittedURL.includes(wordInSong))
                // checking if responce url contains a word from current sing 
                if(!splittedURL.includes(wordInSong)){
                  lyrics = `Sorry, couldn't find any lyrics`;
                }
                else {
                  // getting lyrics from the responce html
                  lyrics = parse(html).querySelector('.lyrics');
                }

                this.setState({result: lyrics, error: ""}, () => {
                  // console.log('ref ', this.imgRef)
                // let result = getAverageRGB(this.imgRef)
                })
              }) 
        })
      })
      .catch(err => {
        console.log("ERROR: " + err);
        this.setState({
          error: err
        })
      })
  }


  render() {
   
    return (
      <div className="App">
        <div className="App-Row" id="top">
          <div className="App-Login">
            <button onClick={() => this.getNowPlaying()}>
              <a href='http://localhost:8888'> 
                Login to Spotify 
              </a>
            </button>
          </div>
          
          { this.state.nowPlaying.artist && (
            <div className="App-Artist">
              <div className="App-Playing">
                <div>Now Playing:</div> 
              </div>

              <div className="App-Artist-Cover">
                <img ref={node => {this.imgRef = node}} crossOrigin="anonymous" src={this.state.nowPlaying.albumArt} style={{ height: 250 }}/>
              </div>
              
              <div className="App-Artist-Info">
                <h2 className="App-Artist-Current">{ this.state.nowPlaying.artist }</h2>
                <h4 className="App-Artist-Song">{ this.state.nowPlaying.name }</h4>
              </div>
            </div>
          )}
          
          {
            this.state.error && <div className="App-Error">Session has expired. Please login to your Spotify account and start playing a song</div>
          }
          
          { this.state.loggedIn &&
            <div className="App-Check-Current">
              <button onClick={() => this.getNowPlaying()}>
                Check Now Playing
              </button>
            </div>
          }
        </div>
        
        <div className="App-Row" id="bottom">
          {
            this.state.result && <div className="App-Lyrics">{ ReactHtmlParser(this.state.result, options) }</div>
          }
        </div>
      </div>
    );
  }
}

export default App;
