import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './components/Home';
import VideoCall from './components/VideoCall';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  return (
    <Router>
      <div className="container mt-5">
        <h1 className="mb-4">WebRTC Video Call App</h1>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/call/:id" component={VideoCall} />
        </Switch>
      </div>
    </Router>
  );
};

export default App;

