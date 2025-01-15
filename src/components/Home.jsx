import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import firebase from '../firebase/firebaseConfig';

const Home = () => {
  const [link, setLink] = useState('');

  useEffect(() => {
    const newLink = uuidv4();
    setLink(newLink);

    firebase.database().ref('links').push(newLink);
  }, []);

  return (
    <div className="jumbotron">
      <h2>Your custom link:</h2>
      <p className="lead">
        <a href={`/call/${link}`}>{`${window.location.origin}/call/${link}`}</a>
      </p>
      <p>Share this link with others to start a video call.</p>
    </div>
  );
};

export default Home;

