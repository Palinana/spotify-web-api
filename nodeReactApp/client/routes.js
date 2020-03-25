import React, {Component} from 'react'
import {connect} from 'react-redux'
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import {Router} from 'react-router-dom'
import App from './app'
import Login from './login'

class Routes extends Component {

  render() {

    return (
        <BrowserRouter>
            <Switch>
                <Route exact path="/" component={App} />
                <Route exact path="/login" component={Login} />
            </Switch>
       </BrowserRouter>
    )
  }
}

export default Routes;
