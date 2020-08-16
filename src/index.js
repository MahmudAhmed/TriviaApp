import React from "react";
import ReactDOM from "react-dom";
import "./styles.css";
import { db } from "./firebase";
const axios = require("axios");

/**
 * ## Implement a simple Trivia Game
 *
 * This API will give you 10 random trivia questions:
 *
 *     https://opentdb.com/api.php?amount=10
 *
 * 1. Build a simple app that displays these questions in a list, where each list item contains:
 *     1. The text `Category: "{category}" | Difficulty: "{difficulty}"`
 *     2. The question, in a h2 element
 *     3. Each answer in a `<button>` element, displayed in random order.
 *     4. Display one question at a time, with prev/next buttons
 *
 * 2. When the player clicks on the answer, add a `.correct` or `.wrong` class to the
 *    list item that wraps the question, based on the correctness of the answer.
 *    Disable all the buttons once the answer is given.
 *
 * 3. Add the following logic for the score keeping:
 *     1. The player starts with 24 points. The goal is to reach 0.
 *     2. If they click on the right answer, we subtract 2 points if the question was easy, 4 if medium, 8 if hard.
 *        If they click on the wrong answer, we add 2 points if the question was easy, 4 if medium, 8 if hard.
 *     3. If they reach a score of exactly 0, display a "Game Over" message, and the number of answers given.
 *     4. Display the current score and the number of answers given in the top-right corner of the page.
 *
 * 4. Add a Leaderboard
 *     1. At the end of the game, ask the player their username and password and save it to a storage of your choice.
 *     2. Display the leaderboard with the top 10 players: their username, the date and their lowest number of answers.
 *     3. Display a "Play again!" button, that starts a new game.
 *     3. Once the user is in the system, they should be able to logout and access again with their username and password.
 */
class TriviaApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      questions: [],
      idx: 0,
      score: 24,
      gameOver: false,
      answeredCorrectly: 0,
      leaderboard: [],
      questionsAnswered: 0,
      lost: false
    };

    this.fetchQuestions = this.fetchQuestions.bind(this);
  }

  componentDidMount = () => {
    this.fetchQuestions();
    this.fetchLeaderboard();
  };

  fetchQuestions = () => {
    return axios.get("https://opentdb.com/api.php?amount=10").then((data) => {
      this.setState({ questions: data.data.results });
    });
  };

  displayQuestions = () => {
    const { questions, idx, score, answeredCorrectly } = this.state;
    const question = questions[idx];
    if (!question) return null;
    return (
      <div>
        <div className="score-board">
          <h2>
            Score: <span>{score}</span>
          </h2>
          <p>
            You answered <span>{answeredCorrectly}</span> correctly...
          </p>
        </div>
        <div className="details">
          <h4>Category: "{question.category}"</h4>
          <h4>Difficulty: "{question.difficulty}"</h4>
        </div>
        <h2 className={question.class}>{question.question}</h2>
        {this.displayAnswers(questions, idx)}
      </div>
    );
  };

  displayAnswers = (questions, questionNumber) => {
    const question = questions[questionNumber];
    const choices = question.incorrect_answers.slice();
    choices.push(question.correct_answer);
    this.shuffleAnswers(choices);
    return (
      <ul className="answer-choices">
        {choices.map((choice, idx) => (
          <li className="answers" key={idx}>
            <button
              disabled={question.disabled}
              onClick={() =>
                this.handleAnswerClk(questions, questionNumber, choice)
              }
            >
              {choice}
            </button>
          </li>
        ))}
      </ul>
    );
  };

  handleAnswerClk = (questions, questionNumber, choice) => {
    const question = questions[questionNumber];
    let {
      score,
      answeredCorrectly,
      gameOver,
      questionsAnswered,
      lost
    } = this.state;
    question.disabled = true;
    questionsAnswered += 1;
    if (question.correct_answer === choice) {
      question.class = "correct";
      if (question.difficulty === "easy") score -= 2;
      if (question.difficulty === "medium") score -= 4;
      if (question.difficulty === "hard") score -= 8;
      answeredCorrectly += 1;
    } else {
      question.class = "wrong";
      if (question.difficulty === "easy") score += 2;
      if (question.difficulty === "medium") score += 4;
      if (question.difficulty === "hard") score += 8;
    }
    if (score === 0) gameOver = true;
    if (questionsAnswered > 9) {
      lost = true;
      gameOver = true;
    }
    this.setState({
      questions,
      score,
      answeredCorrectly,
      gameOver,
      questionsAnswered,
      lost
    });
  };

  shuffleAnswers = (array) => {
    // for (var i = array.length - 1; i > 0; i--) {
    //     var rand = Math.floor(Math.random() * (i + 1));
    //     [array[i], array[rand]] = [array[rand], array[i]]
    // }
    array.sort((a, b) => a - b);
  };

  gameOver = () => {
    let { answeredCorrectly, username, password, recorded, lost } = this.state;

    return (
      <div className="game-over">
        <h1>{lost ? "You Lose" : "You Win!"}</h1>
        <h2>You answered {answeredCorrectly} Correctly!</h2>
        <div className="game-over-container">
          <div>
            <div className="play-again-container">
              <button onClick={this.newGame}>Play again</button>
            </div>
            <div className="login">
              <h2 title="You can only submit your score if you beat the game!">
                Submit Your Score
              </h2>
              <span className={recorded ? "success" : "hidden"}>
                sucessfully submited**
              </span>
              <label>Username</label>
              <input
                disabled={lost}
                type="text"
                value={username}
                title="You can only submit your score if you beat the game!"
                onChange={this.handleChange("username")}
              />
              <label>Password</label>
              <input
                disabled={lost}
                type="password"
                title="You can only submit your score if you beat the game!"
                value={password}
                onChange={this.handleChange("password")}
              />
              <br />
              <button onClick={this.handleSubmit} disabled={recorded || lost}>
                Submit Score
              </button>
            </div>
          </div>

          <div className="leaderboard">
            <h2>Leaderboard</h2>
            {this.displayLeaderboard()}
          </div>
        </div>
      </div>
    );
  };

  newGame = () => {
    this.fetchQuestions();
    this.setState({
      username: "",
      password: "",
      score: 24,
      answeredCorrectly: 0,
      gameOver: false,
      recorded: false,
      questionsAnswered: 0,
      lost: false
    });
  };

  handleChange = (field) => {
    return (e) => {
      this.setState({ [field]: e.target.value });
    };
  };

  handleSubmit = () => {
    const { username, password, answeredCorrectly } = this.state;
    db.collection("scores")
      .doc(username)
      .set({
        username,
        password,
        score: answeredCorrectly,
        date: new Date(Date.now())
      })
      .then(() => {
        this.setState({ username: "", password: "", recorded: true });
      });
  };

  fetchLeaderboard = () => {
    const leaderboard = [];
    db.collection("scores")
      .orderBy("score", "asc")
      .limit(10)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach(function (doc) {
          leaderboard.push(doc.data());
        });
      })
      .then(() => this.setState({ leaderboard }));
  };

  displayLeaderboard = (array = this.state.leaderboard) => {
    return array.map((player, idx) => {
      return (
        <div key={idx} className="scores">
          <h4>#{idx + 1}</h4>
          <h4>Score: {player.score}</h4>
          <h4>
            {new Date(player.date.seconds * 1000).toLocaleDateString("en-US")}
          </h4>
          <h4>{player.username}</h4>
        </div>
      );
    });
  };

  render = () => {
    let { idx, questions, gameOver } = this.state;
    return (
      <div>
        {gameOver ? (
          this.gameOver()
        ) : (
          <div>
            <h1>Welcome to TrustLayer Trivia!</h1>
            {this.displayQuestions()}
            <div className="prev-next-btns">
              {idx > 0 ? (
                <button onClick={() => this.setState({ idx: idx - 1 })}>
                  Prev
                </button>
              ) : (
                <button disabled>Prev</button>
              )}
              {idx < questions.length - 1 ? (
                <button onClick={() => this.setState({ idx: idx + 1 })}>
                  Next
                </button>
              ) : (
                <button disabled>Next</button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };
}

// document.addEventListener("DOMContentLoaded", () => {

ReactDOM.render(<TriviaApp />, document.getElementById("root"));
// })
