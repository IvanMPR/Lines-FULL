// prettier-ignore
import { BOARD_LENGTH, NUMBER_OF_BALLS, GOAL_LENGTH, POINTS_MULTIPLIER } from '../constants.js';

class View {
  constructor() {
    this.board = document.querySelector('.board');
    this.button = document.querySelector('.btn');
    this.body = document.querySelector('body');
    this.failSound = new Audio('./sounds/invalid_move.wav');
  }
  // Create board
  createBoard() {
    let html = '';
    for (let i = 0; i < BOARD_LENGTH * BOARD_LENGTH; i++) {
      html += `<div class="field" data-fieldId="${i}" id="${i}"></div>`;
    }
    this.board.insertAdjacentHTML('beforeend', html.trim());
  }
  // Randomly display balls across the board
  displayBalls(randomColors) {
    const allFields = document.querySelectorAll('.field');

    for (let color of randomColors) {
      const unusedFields = Array.from(allFields)
        .filter(field => field.innerHTML === '')
        .map(field => field.getAttribute('id'));

      const randomNumber = Math.floor(Math.random() * unusedFields.length);
      const randomEmptyField = unusedFields[randomNumber];
      const ballName = `${color}`;
      const ball = document.createElement('div');

      ball.classList.add('color-ball', ballName);
      ball.style.backgroundImage = `url(../images/${ballName}.png)`;
      document.getElementById(randomEmptyField).appendChild(ball);
      // console.log(ball);
      // if (!mainObject.nextRound) return;

      // if (unusedFields.length > 0) {
      //   makeBall(div);
      //   checkScore(Number(div.id));
      // }
    }
    //  console.log('finished');
  }
  addActiveClass(ball) {
    const color = ball.className.split(' ')[1];
    ball.style.outline = `1px dashed white`;
    ball.classList.add('active');
  }
  removeActiveClass() {
    document.querySelectorAll('.color-ball').forEach(ball => {
      ball.style.outline = '1px dashed transparent';
      ball.classList.remove('active');
    });
  }

  //**  function isPath is main BFS function for traversing the adjacency list  **//

  isPathPossible(event, list, stateObject) {
    stateObject.nextRound = true;
    const start = Number(
      document.querySelector('.active').closest('.field').id
    );
    const end = Number(event.target.id);
    // all parents of the adj.list are stored in parentArray, from here shortest path is retraced
    const parentArray = [];
    // adjacency list
    const adjacencyList = list;
    // BFS queue
    const queue = [start];
    // visited set stores visited fields, preventing infinite looping
    const visited = new Set();
    // BFS algorithm
    while (queue.length > 0) {
      const current = queue.shift();
      // for every current field, an object is created with current as a parent, and an empty array for its neighbors. Array is filled later in the code with current neighbors
      parentArray.push({ parent: current, neighbors: [] });
      // go to the next iteration if current has already been visited
      if (visited.has(current)) continue;
      // else, add current to visited set and continue algo
      visited.add(current);
      // if match is found, current === to end field
      if (current === end) {
        // call retrace fn with parentArray as an argument
        // function retrace gets the shortest path from start to end
        // variable path now holds shortest path fields ids
        const path = this.retrace(parentArray, start, end);
        //   console.log(path);
        return path;
      }
      // continuation of BFS algo, if match is not found...we pass its neighbors to the queue and parentArray
      for (let neighbor of adjacencyList[current]) {
        parentArray[parentArray.length - 1].neighbors.push(neighbor);
        queue.push(neighbor);
      }
    }
    // if path creation is impossible, alert will trigger
    alert('It is not possible to create a path');
    return false;
  }

  retrace(arr, start, end) {
    // we start with the end field
    const shortestPath = [end];
    // and loop backwards until we reach the start field
    while (!shortestPath.includes(start)) {
      // we pick the last element in the arr, call it previous
      const previous = shortestPath[shortestPath.length - 1];
      // loop trough his neighbors(children)
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].neighbors.includes(previous) && arr[i].parent !== previous) {
          // and push previous parent in shortest path if above conditions are met
          shortestPath.push(arr[i].parent);
          break;
        }
      }
    }
    // return shortest path
    return shortestPath;
  }

  drawPath(arr) {
    const DELAY_MS = 25;
    let delayBetweenLoops = arr.length * DELAY_MS;
    const ball = document.createElement('div');
    const ballName = document
      .querySelector('.active')
      .getAttribute('class')
      .split(' ')[1];
    ball.classList.add('color-ball', ballName);
    ball.style.backgroundImage = `url(../images/${ballName}.png)`;
    let reversed = arr.reverse();
    for (let i = 0; i < reversed.length; i++) {
      setTimeout(() => {
        document.getElementById(reversed[i]).classList.add('path');
      }, i * DELAY_MS);
    }
    setTimeout(() => {
      for (let j = 0; j < reversed.length - 1; j++) {
        setTimeout(() => {
          document.getElementById(`${reversed[j + 1]}`).appendChild(ball);
          document.getElementById(`${reversed[j]}`).innerHTML = '';
          document.getElementById(reversed[j]).classList.remove('path');
          document.getElementById(reversed[j + 1]).classList.remove('path');
        }, j * DELAY_MS);
      }
    }, delayBetweenLoops);

    //  const interval = setInterval(() => {
    //    let i = 0;
    //    document.getElementById(`${reversed[i]}`).innerHTML = '';
    //    document.getElementById(`${reversed[i + 1]}`).appendChild(ball);
    //    document.getElementById(`${reversed[i]}`).classList.remove('path');
    //    i++;

    //    reversed = reversed.slice(1);

    //    if (i === reversed.length) {
    //      //  removePathClass();
    //      //  removeActiveClass();
    //      clearInterval(interval);
    //    }
    //  }, 150);
  }
  //   }

  moveBall(arr) {
    const reversed = arr.reverse();

    const ballName = document
      .querySelector('.active')
      .getAttribute('class')
      .split(' ')[1];
    const ball = document.createElement('div');
    ball.classList.add('color-ball', ballName);
    ball.style.backgroundImage = `url(../images/${ballName}.png)`;
    console.log(ballName);
    for (let i = 0; i < reversed.length; i++) {
      setTimeout(() => {
        document.getElementById(reversed[i]).innerHTML === '';
        document.getElementById(reversed[i]).classList.remove('path');
      }, i * 20);
    }
    //  const ballName = `${color}`;

    document.getElementById(randomEmptyField).appendChild(ball);
  }
  //   test() {
  //     const el = document.getElementById(5);
  //     el.classList.add('path');
  //   }
}

export default View;
