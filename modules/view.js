// prettier-ignore
import { BOARD_LENGTH, GOAL_LENGTH, POINTS_MULTIPLIER, DELAY_MS } from './constants.js';

class View {
  constructor() {
    this.board = document.querySelector('.board');
    this.button = document.querySelector('.btn');
    this.body = document.querySelector('body');
    this.movesContainer = document.querySelector('.moves');
    this.scoresCount = document.querySelector('.scores');
    this.infoDiv = document.querySelector('.info-div');
    this.infoDivText = document.querySelector('.info-div-p');
    this.invalidMoveSound = new Audio('sounds/invalid_move.wav');
    this.scoreSound = new Audio('sounds/glass.flac');
  }

  // Create board
  createBoard() {
    let html = '';
    // square board so length * length
    for (let i = 0; i < BOARD_LENGTH * BOARD_LENGTH; i++) {
      html += `<div class="field" data-fieldId="${i}" id="${i}"></div>`;
    }
    this.board.insertAdjacentHTML('beforeend', html.trim());
  }
  // Randomly display balls across the board
  displayBalls(randomColors, helperObject) {
    // prevent console error (with try/catch block) when the entire board is filled with balls
    try {
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
        ball.style.backgroundImage = `url(images/${ballName}.png)`;
        document.getElementById(randomEmptyField).appendChild(ball);
        // check if random placement of balls results with score
        // place it in timeout to be sure that random placement of the ball will finish before checking the score starts
        setTimeout(() => {
          this.checkScore(randomEmptyField, helperObject);
        }, 0);
      }
    } catch (error) {}
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

  drawPathAndMoveBall(arr, helperObject, id) {
    // prevent error in console when move is not possible with try/catch block
    try {
      let delayBetweenLoops = arr.length * DELAY_MS;
      // dynamic delay between placing new balls, depending on the duration of the previous move
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
      ball.style.backgroundImage = `url(images/${ballName}.png)`;
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
            setTimeout(() => {
              this.checkScore(id, helperObject);
            }, 0);
          }, j * DELAY_MS);
        }
      }, delayBetweenLoops);
    } catch (err) {
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
        ball.style.backgroundImage = `url(images/${color}.png)`;
        this.movesContainer.appendChild(ball);
      }, i * 100);
    });
  }

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

    // Check if the game is over
    const allFields = document.querySelectorAll('.field');
    const unusedFields = Array.from(allFields).filter(
      field => field.innerHTML === ''
    );
    setTimeout(() => {
      if (unusedFields.length === 0 && helperObject.nextRound) {
        this.gameOver();
      }
    }, 300);
  }

  deleteIfBallsConsecutive(arrToTest, colorName, arrToDel, helperObject) {
    const indexes = [];
    for (let i = 0; i <= GOAL_LENGTH; i++) {
      const current = arrToTest.slice(i, i + GOAL_LENGTH);
      if (
        current.every(el => el === colorName) &&
        current.length >= GOAL_LENGTH
      ) {
        indexes.push(i);
      }
    }

    if (indexes.length === 0) {
      helperObject.nextRound = true;
      return;
    }

    let indexesToDelete = Array.from(
      { length: indexes.length + GOAL_LENGTH - 1 },
      (_, i) => indexes[0] + i
    );

    // Delete consecutive balls, highlight fields of the consecutive balls
    arrToDel.map((el, i) => {
      const field = document.getElementById(`${el}`);
      const initialBg = field.getAttribute('background-color');
      if (indexesToDelete.includes(i)) {
        field.classList.add('score-fields');
        field.style.backgroundColor = colorName;
        setTimeout(() => {
          field.classList.remove('score-fields');
          field.style.backgroundColor = initialBg;
        }, 300);
        field.innerHTML = '';
      } else {
        return el;
      }
    });

    this.scoreSound.play();

    // Update internal result count
    helperObject.count +=
      (indexes.length - 1 + GOAL_LENGTH) * POINTS_MULTIPLIER;
    // Stop ball placement after the score
    helperObject.nextRound = false;
    // Update score in UI
    this.updateScore(helperObject);
  }

  updateScore(helperObject) {
    this.scoresCount.textContent = helperObject.count;
  }
  moveNotPossible() {
    this.infoDiv.classList.remove('hidden');
    this.invalidMoveSound.play();

    setTimeout(() => {
      this.infoDiv.classList.add('hidden');
    }, 1000);
  }
  gameOver() {
    const infoText = 'Game Over !';
    this.infoDivText.textContent = infoText;
    this.infoDiv.classList.remove('hidden');
  }
  createRefreshButton() {
    const rfButton = document.createElement('button');
    rfButton.classList.add('btn', 'btn-restart');
    rfButton.textContent = 'Restart Game';
    rfButton.addEventListener('click', this.restartGame);
    this.board.insertAdjacentElement('afterend', rfButton);
  }
  restartGame() {
    return location.reload();
  }
}

export default View;
