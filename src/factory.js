export class Ship {
  constructor(length) {
    this.length = length;
    this.numHits = 0;
    this.origin = { x: undefined, y: undefined, align: undefined };
  }

  hit() {
    if (this.isSunk()) return;
    this.numHits += 1;
  }

  isSunk() {
    return this.numHits >= this.length;
  }
}

export class Gameboard {
  constructor() {
    this.board = [];
    this.ships = [];
    for (let i = 0; i < 10; i++) {
      this.board[i] = [];
      for (let j = 0; j < 10; j++) {
        this.board[i][j] = { ship: undefined, tileHit: false };
      }
    }
  }

  allShipsSunk() {
    let numOfSunkenShips = 0;
    this.ships.forEach((ship) => {
      if (ship.isSunk()) numOfSunkenShips += 1;
    });

    return numOfSunkenShips >= this.ships.length;
  }

  place(x, y, length, align) {
    const newShip = new Ship(length);
    const xVal = Number(x);
    const yVal = Number(y);
    const lenVal = Number(length);

    newShip.origin.x = x;
    newShip.origin.y = y;
    newShip.origin.align = align;

    if (align === 'horizontal') {
      // check fit
      if (yVal + lenVal - 1 > 9)
        throw new Error(
          'Ship does not fit horizontally ' + yVal + ' ' + (yVal + lenVal - 1)
        );
      // check overlap
      for (let i = yVal; i < yVal + lenVal; i++)
        if (this.board[xVal][i].ship)
          throw new Error(
            'Ship overlaps with another ' +
              this.board[xVal][i].ship.origin.x +
              ' ' +
              this.board[xVal][i].ship.origin.y
          );

      // valid
      for (let i = yVal; i < yVal + lenVal; i++)
        this.board[xVal][i].ship = newShip;
      this.ships.push(newShip);
      return 'OK';
    }

    if (align === 'vertical') {
      // check fit
      if (xVal + lenVal - 1 > 9)
        throw new Error('Ship does not fit vertically.');
      // check overlap
      for (let i = xVal; i < xVal + lenVal; i++)
        if (this.board[i][yVal].ship)
          throw new Error('Ship overlaps with another ');

      // valid
      for (let i = xVal; i < xVal + lenVal; i++)
        this.board[i][yVal].ship = newShip;
      this.ships.push(newShip);
      return 'OK';
    }
  }

  receiveAttack(x, y) {
    const xVal = Number(x);
    const yVal = Number(y);

    if (this.board[xVal][yVal].tileHit) {
      throw new Error('Tile was hit already');
    }

    if (this.board[xVal][yVal].ship) {
      this.board[xVal][yVal].tileHit = true;
      this.board[xVal][yVal].ship.hit();
    } else {
      this.board[xVal][yVal].tileHit = true;
    }
  }
}

export class Player {
  static id = 0;
  constructor() {
    Player.id += 1;
    this.playerID = Player.id;
    this.playerGameboard = new Gameboard();
    this.opponent = undefined;
  }

  attackTile(x, y) {
    const xVal = Number(x);
    const yVal = Number(y);

    try {
      this.opponent.playerGameboard.receiveAttack(xVal, yVal);
      return 'OK';
    } catch (err) {
      return err;
    }
  }

  placeShip(x, y, length, alignment) {
    const xVal = Number(x);
    const yVal = Number(y);
    const lenVal = Number(length);
    try {
      this.playerGameboard.place(xVal, yVal, lenVal, alignment);
    } catch (err) {
      return err;
    }
  }
}

export class CPU extends Player {
  constructor() {
    super();
  }

  calcAttack() {
    for (let i = 0; i < 100; i++) {
      try {
        const randX = Math.floor(Math.random() * 10);
        const randY = Math.floor(Math.random() * 10);

        this.opponent.playerGameboard.receiveAttack(randX, randY);
        const coordObj = { x: randX, y: randY };
        return coordObj;
      } catch (err) {}
    }
    throw new Error(
      'Unable to execute Attack on random Tile after 100 attempts'
    );
  }

  placeShip(length) {
    const lenVal = Number(length);
    for (let i = 0; i < 100; i++) {
      const randX = Math.floor(Math.random() * 10);
      const randY = Math.floor(Math.random() * 10);
      const align =
        Math.floor(Math.random() * 3 + 1) === 1 ? 'horizontal' : 'vertical';

      try {
        if (this.playerGameboard.place(randX, randY, lenVal, align) === 'OK') {
          return;
        }
      } catch (err) {
        continue;
      }
    }
  }
}
