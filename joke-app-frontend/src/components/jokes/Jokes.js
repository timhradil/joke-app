import React, { useState, useEffect } from "react";
import "./Jokes.css";

export default function Jokes() {
  const [jokes, setJokes] = useState([]);
  const [userVotes, setUserVotes] = useState({});

  useEffect(() => {
    getJokes();
  }, []);

  const getJokes = async () => {
    try {
      const jokesResponse = await fetch(
        "https://mc9cbmybvi.execute-api.us-west-2.amazonaws.com/Stage/get_jokes"
      );
      const votesResponse = await fetch(
        "https://mc9cbmybvi.execute-api.us-west-2.amazonaws.com/Stage/get_votes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: localStorage.getItem("uuid") }),
        }
      );

      if (!jokesResponse.ok || !votesResponse.ok) {
        throw new Error("Failed to fetch jokes or votes");
      }

      const jokesData = await jokesResponse.json();
      const votesData = await votesResponse.json();

      setJokes(jokesData.jokes);
      setUserVotes(votesData.votes);
    } catch (error) {
      console.error(error);
    }
  };

  const putVote = async (id, type) => {
    try {
      await fetch("https://mc9cbmybvi.execute-api.us-west-2.amazonaws.com/Stage/put_vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: localStorage.getItem("uuid"),
          jokeId: id,
          type: type,
        }),
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleVote = (id, type) => {
    const existingVote = userVotes[id];
    let updatedVotes = { ...userVotes };

    if (existingVote === type) {
      delete updatedVotes[id];
    } else {
      updatedVotes[id] = type;
    }

    setJokes((prevJokes) =>
      prevJokes.map((joke) => {
        if (joke.jokeId === id) {
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
        }
        return joke;
      })
    );

    putVote(id, type);
    setUserVotes(updatedVotes);
  };

  const sortedJokes = jokes.sort((a, b) => b.votes - a.votes);

  return (
    <div className="jokes-container">
      <h1>Jokes Leaderboard</h1>
      <button className="refresh-button" onClick={getJokes}>
        Refresh
      </button>
      <ol className="jokes-leaderboard">
        {sortedJokes.map((joke, index) => (
          <li key={joke.jokeId} className="joke-card">
            <span className="joke-position">{index + 1}.</span>
            <p className="joke-text">{joke.joke}</p>
            <div className="joke-votes">
              <button
                disabled={userVotes[joke.jokeId] === "upvote"}
                onClick={() => handleVote(joke.jokeId, "upvote")}
                className="vote-button"
              >
                <span role="img" aria-label="upvote">
                  👍
                </span>
              </button>
              <span className="vote-count">{joke.votes}</span>
              <button
                disabled={userVotes[joke.jokeId] === "downvote"}
                onClick={() => handleVote(joke.jokeId, "downvote")}
                className="vote-button"
              >
                <span role="img" aria-label="downvote">
                  👎
                </span>
              </button>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
