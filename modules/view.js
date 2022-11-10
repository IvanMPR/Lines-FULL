// prettier-ignore
import { BOARD_LENGTH, NUMBER_OF_BALLS, GOAL_LENGTH, POINTS_MULTIPLIER } from './constants.js';

class View {
  constructor() {
    this.board = document.querySelector('.board');
    this.button = document.querySelector('.btn');
    this.body = document.querySelector('body');
    this.failSound = new Audio('./sounds/invalid_move.wav');
    this.movesContainer = document.querySelector('.moves');
    this.scoresCount = document.querySelector('.scores');
    this.invalidMoveDiv = document.querySelector('.move-not-possible');
    this.invalidMoveSound = new Audio('../sounds/invalid_move.wav');
    this.scoreSound = new Audio('../sounds/clink.wav');
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
  displayBalls(randomColors, helperObject) {
    if (!helperObject.nextRound) return;
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
    this.moveNotPossible();
    return;
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

  drawPathAndMoveBall(arr, helperObject) {
    // prevent error in console when move is not possible
    try {
      const DELAY_MS = 25;
      let delayBetweenLoops = arr.length * DELAY_MS;
      // dynamic delay between placing new balls, depending on the time length of the previous move
      // clear old delay
      helperObject.delay = 0;
      // calc new delay, add 100ms just in case, pass delay value in helper object
      helperObject.delay = delayBetweenLoops + arr.length * DELAY_MS + 100;
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
    } catch (err) {
      helperObject.nextRound = false;
      // console.log(err.message);
      this.moveNotPossible();
    }
  }
  displayNextBalls(colorsArray, helperObject) {
    if (!helperObject.nextRound) return;
    this.movesContainer.innerHTML = '';

    colorsArray.forEach((color, i) => {
      setTimeout(() => {
        const ball = document.createElement('div');
        ball.classList.add('color-ball', color);
        ball.style.backgroundImage = `url(../images/${color}.png)`;
        this.movesContainer.appendChild(ball);
      }, i * 100);
    });
    // console.log(colorsArray);
  }
  // ---------------------------------------------------------------------------- //
  buildRowColAndDiagonals(id) {
    // Pad first row with zero, in order to be able to split cell id, for determining row and col
    const tuple = String(id)
      .padStart(2, '0')
      .split('')
      .map(el => Number(el));

    // Identify row by data from tuple[0]
    const row = Array.from(
      { length: BOARD_LENGTH },
      (_, i) => tuple[0] * BOARD_LENGTH + i
    );

    // Identify column by data from tuple[1]
    const column = Array.from(
      { length: BOARD_LENGTH },
      (_, i) => tuple[1] + i * BOARD_LENGTH
    );

    // Build first diagonal from top left to bottom right direction
    const diagonalFromLeftToRight = pair => {
      let start;
      let step = BOARD_LENGTH + 1;
      if (pair[0] - pair[1] > 0) {
        start = (pair[0] - pair[1]) * BOARD_LENGTH;
      } else if (pair[0] - pair[1] < 0) {
        start = pair[1] - pair[0];
      } else {
        start = 0;
      }

      return Array.from(
        {
          length:
            start < BOARD_LENGTH
              ? BOARD_LENGTH - start
              : (BOARD_LENGTH * BOARD_LENGTH - start) / BOARD_LENGTH,
        },
        (_, i) => start + i * step
      );
    };
    const topLeftBottomRight = diagonalFromLeftToRight(tuple);

    // Build second diagonal from top right to bottom left direction
    const diagonalFromRightToLeft = pair => {
      let start;
      let step = BOARD_LENGTH - 1;

      if (pair[0] + pair[1] <= step) {
        start = pair[0] + pair[1];
      } else {
        const calcStart = String(pair[0] + pair[1])
          .split('')
          .map(el => Number(el))
          .reduce((acc, curr) => acc + curr, 0);
        start = Number(calcStart + String(step));
      }

      return Array.from(
        {
          length:
            start < BOARD_LENGTH
              ? start + 1
              : Number(String(start).slice(-1)) -
                Number(String(start).slice(0, 1)) +
                1,
        },
        (_, i) => start + i * step
      );
    };
    const topRightBottomLeft = diagonalFromRightToLeft(tuple);

    const result = {
      row: row,
      column: column,
      topLeftBottomRight: topLeftBottomRight,
      topRightBottomLeft: topRightBottomLeft,
    };
    console.log(result);

    return result;
  }
  // Helper fn to extract color name of the color ball used in the cell with some 'id'
  extractColor = id =>
    document.getElementById(`${id}`).innerHTML === ''
      ? id
      : document.getElementById(`${id}`).firstChild.className.split(' ')[1];
  // ----------------------------------------------------------------- //
  // TopLeftBottomRight - tlbr, TopRightBottomLeft - trbl
  mapRowColAndDiagonals(row, col, tlbr, trbl) {
    // Map row fields, if empty, leave id, else put color name
    const rowMapped = row.map(num => this.extractColor(num));
    // Same as above, just for column
    const columnMapped = col.map(num => this.extractColor(num));
    // LR diagonal mapped
    const leftToRightDiagMapped = tlbr.map(num => this.extractColor(num));
    // RL diagonal mapped
    const rightToLeftDiagMapped = trbl.map(num => this.extractColor(num));
    const result = {
      rowMapped: rowMapped,
      columnMapped: columnMapped,
      leftToRightDiagMapped: leftToRightDiagMapped,
      rightToLeftDiagMapped: rightToLeftDiagMapped,
    };
    return result;
  }
  checkScore(id, helperObject) {
    //  Retrieve color name as a string, for later check in the row and col and diagonals
    const colorToMatch = this.extractColor(id);
    const unmappedFields = this.buildRowColAndDiagonals(id);
    const mappedFields = this.mapRowColAndDiagonals(
      unmappedFields.row,
      unmappedFields.column,
      unmappedFields.topLeftBottomRight,
      unmappedFields.topRightBottomLeft
    );

    // Logic for determining if score happened or not
    const colorOccurrences = (arr, colorName = colorToMatch) => {
      return arr.filter(el => el === colorName).length;
    };
    // If number of balls of current color >= GOAL_LENGTH in the current row, check if they are consecutive
    if (colorOccurrences(mappedFields.rowMapped) >= GOAL_LENGTH) {
      this.deleteIfBallsConsecutive(
        mappedFields.rowMapped,
        colorToMatch,
        unmappedFields.row,
        helperObject
      );
    }
    // If number of balls of current color >= GOAL_LENGTH in the current column, check if they are consecutive
    if (colorOccurrences(mappedFields.columnMapped) >= GOAL_LENGTH) {
      this.deleteIfBallsConsecutive(
        mappedFields.columnMapped,
        colorToMatch,
        unmappedFields.column,
        helperObject
      );
    }
    // If number of balls of current color >= GOAL_LENGTH in the current TOP L BOTTOM R diagonal, check if they are consecutive
    if (colorOccurrences(mappedFields.leftToRightDiagMapped) >= GOAL_LENGTH) {
      this.deleteIfBallsConsecutive(
        mappedFields.leftToRightDiagMapped,
        colorToMatch,
        unmappedFields.topLeftBottomRight,
        helperObject
      );
    }
    // If number of balls of current color >= GOAL_LENGTH in the current TOP R BOTTOM L diagonal, check if they are consecutive

    if (colorOccurrences(mappedFields.rightToLeftDiagMapped) >= GOAL_LENGTH) {
      this.deleteIfBallsConsecutive(
        mappedFields.rightToLeftDiagMapped,
        colorToMatch,
        unmappedFields.topRightBottomLeft,
        helperObject
      );
    }
    // updateResult(mainObject.count);
    // ----------------------------------------------------------- //
    // Check if game is over
    const allFields = document.querySelectorAll('.field');
    const unusedFields = Array.from(allFields).filter(
      field => field.innerHTML === ''
    );
    setTimeout(() => {
      if (unusedFields.length === 0 && helperObject.nextRound) {
        gameOver();
      }
    }, 300);
  }
  // ---------------------------------------------------------------------------- //
  deleteIfBallsConsecutive(arrTest, colorName, arrToDel, helperObject) {
    const indexes = [];
    for (let i = 0; i <= GOAL_LENGTH; i++) {
      const current = arrTest.slice(i, i + GOAL_LENGTH);
      if (
        current.every(el => el === colorName) &&
        current.length >= GOAL_LENGTH
      ) {
        indexes.push(i);
      }
    }

    if (indexes.length === 0) return;

    let indexesToDelete = Array.from(
      { length: indexes.length + GOAL_LENGTH - 1 },
      (_, i) => indexes[0] + i
    );

    setTimeout(() => {
      arrToDel.map((el, i) =>
        indexesToDelete.includes(i)
          ? (document.getElementById(`${el}`).innerHTML = '')
          : el
      );
    }, helperObject.delay);
    // Update internal result count

    helperObject.count +=
      (indexes.length - 1 + GOAL_LENGTH) * POINTS_MULTIPLIER;
    // Stop ball placement after the hit is scored
    helperObject.nextRound = false;
    this.updateScore(helperObject);
  }
  updateScore(helperObject) {
    this.scoresCount.textContent = helperObject.count;
  }
  moveNotPossible() {
    this.invalidMoveDiv.classList.remove('hidden');
    this.invalidMoveSound.play();
    // this.scoreSound.play();
    setTimeout(() => {
      this.invalidMoveDiv.classList.add('hidden');
    }, 1000);
  }
}

export default View;
