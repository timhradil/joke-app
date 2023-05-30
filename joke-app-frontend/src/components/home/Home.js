import React, { useState } from 'react';
import './Home.css';

export default function Home() {
  const [jokeTopic, setJokeTopic] = useState('');
  const [joke, setJoke] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setJokeTopic('');
    setJoke('Generating joke...')

    try {
      const response = await fetch('https://mc9cbmybvi.execute-api.us-west-2.amazonaws.com/Stage/generate_joke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic: jokeTopic }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch joke');
      }

      const jokeData = await response.json();
      setJoke(jokeData.joke);
    } catch (error) {
      console.error(error);
      setJoke('Failed to generate joke. Try again.');
    }
  };

  const handleChange = (event) => {
    setJokeTopic(event.target.value);
  };

  return (
    <div className="home-container">
      <h1>Create a Joke</h1>
      <form className="joke-form" onSubmit={handleSubmit}>
        <label htmlFor="jokeInput">Create a joke about</label>
        <input
          type="text"
          id="jokeInput"
          value={jokeTopic}
          onChange={handleChange}
          placeholder="Joke Topic"
        />
        <button type="submit">Submit</button>
      </form>
      <p className="generated-joke">{joke}</p>
    </div>
  );
}
