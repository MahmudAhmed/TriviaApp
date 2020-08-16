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
      gameOver: true,
      answeredCorrectly: 0,
      leaderboard: []
    };

    this.fetchQuestions = this.fetchQuestions.bind(this);
  }

  componentDidMount = () => {
    this.fetchQuestions();
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
    let { score, answeredCorrectly, gameOver } = this.state;
    question.disabled = true;
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
    this.setState({ questions, score, answeredCorrectly, gameOver });
  };

  shuffleAnswers = (array) => {
    // for (var i = array.length - 1; i > 0; i--) {
    //     var rand = Math.floor(Math.random() * (i + 1));
    //     [array[i], array[rand]] = [array[rand], array[i]]
    // }
    array.sort((a, b) => a - b);
  };

  gameOver = () => {
    let { answeredCorrectly } = this.state;
    this.leaderboard();
    return (
      <div className="game-over">
        <h1>Game Over!</h1>
        <h2>You answered {answeredCorrectly} Correctly!</h2>
      </div>
    );
  };

  leaderboard = () => {
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
      .then(
        () => this.setState({ leaderboard }),
        () => console.log(this.state.leaderboard)
      );
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
