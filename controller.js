import Model from './modules/model.js';
import View from './modules/view.js';
// prettier-ignore
import { BOARD_LENGTH, NUMBER_OF_BALLS, GOAL_LENGTH, POINTS_MULTIPLIER } from './constants.js';

class Controller {
  constructor(m, v) {
    this.m = m;
    this.v = v;
    this.startButton = this.v.button;
    this.gameBoard = this.v.board;
    this.helperObject = this.m.stateObject;
  }
  // create board
  ctrlCreateBoard() {
    return this.v.createBoard();
  }
  // create random colors
  ctrlGetRandomColors(numberOfBalls) {
    return this.m.getRandomColors(numberOfBalls);
  }
  // display balls with random colors from above fn
  ctrlDisplayBalls(randomColors) {
    //  console.log(this.helperObject);
    return this.v.displayBalls(randomColors);
  }
  // add active class if click happened on the ball
  ctrlAddActiveClass(ball) {
    return this.v.addActiveClass(ball);
  }
  // remove active class
  ctrlRemoveActiveClass() {
    return this.v.removeActiveClass();
  }
  // create an adjacencyList for BFS shortest path traversal
  ctrlMakeList() {
    return this.m.makeList();
  }
  // returns an array with shortest path from start to end, or fail message if path is not possible
  ctrlPath(event, list, stateObject) {
    return this.v.isPathPossible(event, list, stateObject);
  }

  ctrlDrawPath(shortestPathArray) {
    return this.v.drawPath(shortestPathArray);
  }

  ctrlMoveBall(shortestPathArray) {
    return this.v.moveBall(shortestPathArray);
  }

  listeners() {
    // initialize board
    this.ctrlCreateBoard();
    //  initialize first random colors
    this.ctrlGetRandomColors(NUMBER_OF_BALLS);
    //  start game, hide button
    this.startButton.addEventListener('click', () => {
      // display balls having randomly picked colors stored in the helper object
      this.ctrlDisplayBalls(this.helperObject.nextMove);
      // hide button
      this.startButton.style.display = 'none';
    });
    // --- Click on the ball to select it for movement --- Event delegation --- //
    this.gameBoard.addEventListener('click', e => {
      // return if click did not happen on the color ball --- guard clause
      if (!e.target.classList.contains('color-ball')) return;
      // clear active class from any ball might have it
      this.ctrlRemoveActiveClass();
      // assign active class on the clicked ball
      this.ctrlAddActiveClass(e.target);
    });
    // --- Click on the desired empty field to move the ball if the path is possible --- Event delegation --- //
    this.gameBoard.addEventListener('click', e => {
      // guard-clause --- return if the click happened anywhere except the empty field
      if (
        e.target.classList.contains('color-ball') ||
        !document.querySelector('.active')
      )
        return;
      // this.helperObject.nextRound = true;
      const path = this.ctrlPath(e, this.ctrlMakeList(), this.helperObject);
      this.ctrlDrawPath(path);
      // this.ctrlMoveBall(path);
      // remove active class
      this.ctrlRemoveActiveClass();
    });
  }
}

const App = new Controller(new Model(), new View());
App.listeners();
