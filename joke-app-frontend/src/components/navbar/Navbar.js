import React from 'react';
import './Navbar.css';

export default function Navbar() {
  return (
    <div className="navbar-container">
      <a className="navbar-link" href="/">Create a Joke</a>
      <a className="navbar-link" href="/jokes">Jokes Leaderboard</a>
    </div>
  );
}
