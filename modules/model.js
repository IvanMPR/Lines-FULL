class Model {
  constructor() {
    this.stateObject = {
      count: 0,
      nextRound: true,
      nextMove: [],
      shortestPath: [],
      delay: 0,
      isGameOver: false,
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
    // clear previous balls before pick new ones
    this.stateObject.nextMove = [];

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
      numberOfBalls--;
    }
  };

  // helper fn for making adjacency list, returns boolean
  isDivEmpty(divId) {
    return document.getElementById(`${divId}`).innerHTML !== '';
  }
  // creating adjacency list
  makeList() {
    // init empty object to store list
    const list = {};
    // get all fields from the board
    const gameFields = Array.from(document.querySelectorAll('.field'));
    // loop trough every field and create his neighbors list
    gameFields.forEach(field => {
      // identify field
      const id = Number(field.getAttribute('id'));
      // check his neighbors in all four directions
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
      // get all directions and filter out false ones - they are occupied
      const values = [up, down, left, right].filter(el => el !== false);
      // create entry in the list for the current field
      list[id] = values;
    });
    // ...and return final list
    return list;
  }

  //**  function isPathPossible is main BFS function for traversing the adjacency list  **//

  isPathPossible(event, moveNotPossibleFn) {
    this.stateObject.nextRound = true;
    const start = Number(
      document.querySelector('.active').closest('.field').id
    );
    const end = Number(event.target.id);
    // all parents of the adj.list are stored in parentArray, from here shortest path is retraced
    const parentArray = [];
    // adjacency list
    const adjacencyList = this.makeList();
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
    // if path creation is not possible...
    // prevent next move
    this.stateObject.nextRound = false;
    // display message in UI that path is not possible
    moveNotPossibleFn.bind(this);
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

    return shortestPath;
  }
}

export default Model;
