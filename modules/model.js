// prettier-ignore
import { BOARD_LENGTH, NUMBER_OF_BALLS, GOAL_LENGTH, POINTS_MULTIPLIER } from './constants.js';
class Model {
  constructor() {
    this.stateObject = {
      count: 0,
      nextRound: true,
      nextMove: [],
      shortestPath: [],
      delay: 0,
    };
  }
  // Fisher - Yates shuffle
  shuffle(array) {
    var currentIndex = array.length,
      temporaryValue,
      randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  }

  getRandomColors = numberOfBalls => {
    if (!this.stateObject.nextRound) return;
    // this.stateObject.nextMove = [];
    //  const result = [];
    const colors = [
      'black',
      'blue',
      'green',
      'orange',
      'pink',
      'purple',
      'red',
    ];

    while (numberOfBalls > 0) {
      const randomColor = this.shuffle(colors)[0];
      this.stateObject.nextMove.push(randomColor);
      // result.push(randomColor);
      numberOfBalls--;
    }
  };
  // helper fn for making adjacency list, returns boolean
  isDivEmpty(divId) {
    return document.getElementById(`${divId}`).innerHTML !== '';
  }
  // creating adjacency list
  makeList() {
    const list = {};
    const gameFields = Array.from(document.querySelectorAll('.field'));
    gameFields.forEach(field => {
      const id = Number(field.getAttribute('id'));

      const up =
        id < 10 || id - 10 < 0 || this.isDivEmpty(id - 10) ? false : id - 10;
      const down =
        id >= 90 || id + 10 > 99 || this.isDivEmpty(id + 10) ? false : id + 10;
      const left =
        id % 10 === 0 || id - 1 < 0 || this.isDivEmpty(id - 1) ? false : id - 1;
      const right =
        id % 10 === 9 || id + 1 > 99 || this.isDivEmpty(id + 1)
          ? false
          : id + 1;

      const values = [up, down, left, right].filter(el => el !== false);
      list[id] = values;
    });

    // console.log(list);
    return list;
  }
}

export default Model;
