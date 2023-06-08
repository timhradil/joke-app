import React, { useState } from "react";
import "./Home.css";

export default function Home() {
  const [jokeTopic, setJokeTopic] = useState("");
  const [joke, setJoke] = useState(null);
  const [userVote, setUserVote] = useState(null);
  const [generatingJoke, setGeneratingJoke] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!jokeTopic) {
      setJoke("Please enter a joke topic.");
      return;
    }
    setJokeTopic("");
    setGeneratingJoke(true);

    try {
      const response = await fetch(
        "https://mc9cbmybvi.execute-api.us-west-2.amazonaws.com/Stage/generate_joke",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ topic: jokeTopic }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch joke");
      }

      const jokeData = await response.json();
      setGeneratingJoke(false);
      setJoke(jokeData.joke);
    } catch (error) {
      console.error(error);
      setGeneratingJoke(false);
      setJoke("Failed to generate joke. Try again.");
    }
  };

  const handleChange = (event) => {
    setJokeTopic(event.target.value);
  };

  const putVote = async (id, type) => {
    try {
      await fetch(
        "https://mc9cbmybvi.execute-api.us-west-2.amazonaws.com/Stage/put_vote",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: localStorage.getItem("uuid"),
            jokeId: id,
            type: type,
          }),
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleVote = (id, type) => {
    const existingVote = userVote;
    let updatedVote = { ...userVote };

    if (existingVote === type) {
      updatedVote = null;
    } else {
      updatedVote = type;
    }

    setJoke((joke) => {
      if (existingVote === "upvote" && type === "downvote") {
        return { ...joke, votes: joke.votes - 2 };
      } else if (existingVote === "downvote" && type === "upvote") {
        return { ...joke, votes: joke.votes + 2 };
      } else if (existingVote === "upvote" && type === "upvote") {
        return { ...joke, votes: joke.votes - 1 };
      } else if (existingVote === "downvote" && type === "downvote") {
        return { ...joke, votes: joke.votes + 1 };
      } else {
        return {
          ...joke,
          votes: joke.votes + (type === "upvote" ? 1 : -1),
        };
      }
    });

    putVote(id, type);
    setUserVote(updatedVote);
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
      {generatingJoke ? 
        <div className="loading">
          <div className="loading-spinner"></div>
        </div>
      : joke && (
        <li key={joke.jokeId} className="joke-card">
          <p className="joke-text">{joke.joke}</p>
          <div className="joke-votes">
            <button
              disabled={userVote === "upvote"}
              onClick={() => handleVote(joke.jokeId, "upvote")}
              className="vote-button"
            >
              <span role="img" aria-label="upvote">
                👍
              </span>
            </button>
            <span className="vote-count">{joke.votes}</span>
            <button
              disabled={userVote === "downvote"}
              onClick={() => handleVote(joke.jokeId, "downvote")}
              className="vote-button"
            >
              <span role="img" aria-label="downvote">
                👎
              </span>
            </button>
          </div>
        </li>
      )}
    </div>
  );
}
