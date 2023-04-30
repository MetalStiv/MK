import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route } from 'react-router-dom';
import LoginPage from './loginPage'
import ErrorPage from './errorPage'
import MainComponent from './mainComponent'
import history from './common/history';
import * as serviceWorker from './serviceWorker';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      role: -1
    };
    this.setRole = this.setRole.bind(this);
    this.getRole = this.getRole.bind(this);
  }

  setRole(value){
    this.setState({role: value})
  }

  getRole(){
    return this.state.role
  }

  render(){
    return (
      <Router history={history}>
        <Route exact path='/' render={() => <LoginPage onGetRole={this.setRole}/>} />
        <Route path='/mk/'
          render={() => <MainComponent getRole={this.getRole}/>}
        />
        <Route path='/error/' component={ErrorPage}/>
      </Router>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA

//serviceWorker.unregister();
serviceWorker.register();
