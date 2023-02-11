import { Ship, Gameboard, Player, CPU } from '../src/factory';

describe('Ship test', () => {
  test('Ship registers 1 hit', () => {
    const ship = new Ship(3);
    ship.hit();
    expect(ship.numHits).toBe(1);
  });

  test('Ship is sunk if number of hits equals length', () => {
    const ship = new Ship(3);
    ship.hit();
    ship.hit();
    ship.hit();
    expect(ship.isSunk).toBeTruthy();
  });

  test('Ship does not register hits if is sunk', () => {
    const ship = new Ship(3);
    ship.hit();
    ship.hit();
    ship.hit();
    ship.hit();
    expect(ship.numHits).toBe(3);
  });
});

describe('Gameboard test', () => {
  test('Gameboard initialisation works', () => {
    const game = new Gameboard();
    for (let i = 0; i < game.board.length; i++) {
      for (let j = 0; j < game.board.length; j++) {
        expect(game.board[i][j]).toEqual({ ship: undefined, tileHit: false });
      }
    }
  });

  test('Gameboard places ship (length: 4, origin: {0,0,horizontal})', () => {
    const game = new Gameboard();
    game.place(0, 1, 4, 'horizontal');

    // check placed row
    for (let i = 1; i < 5; i++) expect(game.board[0][i].ship).toBeTruthy();
    // check one vertical row below
    for (let i = 1; i < 5; i++) expect(game.board[1][i].ship).toBeFalsy();
    // check limits
    expect(game.board[0][0].ship).toBeFalsy();
    expect(game.board[0][5].ship).toBeFalsy();
  });

  test('Gameboard does not place ship when overlapping with another ship', () => {
    const game = new Gameboard();

    try {
      game.place(0, 1, 4, 'horizontal');
      game.place(0, 2, 3, 'vertical');
    } catch (err) {}

    expect(game.board[1][2].ship).toBeFalsy();
  });

  test('Ship gets pushed when placed', () => {
    const game = new Gameboard();
    game.place(0, 1, 4, 'horizontal');

    expect(game.ships.length).not.toBe(0);
  });

  test('All Ships sunk', () => {
    const game = new Gameboard();
    game.place(0, 1, 4, 'horizontal');
    const ship = game.board[0][1].ship;
    ship.hit();
    ship.hit();
    ship.hit();
    ship.hit();

    expect(game.allShipsSunk()).toBeTruthy();
  });

  test('Not all Ships sunk', () => {
    const game = new Gameboard();
    game.place(0, 1, 4, 'horizontal');
    const ship = game.board[0][1].ship;
    ship.hit();
    ship.hit();
    ship.hit();

    expect(game.allShipsSunk()).toBeFalsy();
  });

  test('Attack empty tile', () => {
    const game = new Gameboard();
    game.place(0, 1, 4, 'horizontal');
    game.receiveAttack(1, 0);

    expect(game.board[1][0]).toEqual({ ship: undefined, tileHit: true });
  });

  test('Attack ship tile', () => {
    const game = new Gameboard();
    game.place(0, 1, 4, 'horizontal');
    game.receiveAttack(0, 1);

    expect(game.board[0][1].ship.numHits).toBe(1);
    expect(game.board[0][1].ship.isSunk()).toBeFalsy();
  });

  test('Attack the same ship tile twice', () => {
    const game = new Gameboard();
    game.place(0, 1, 4, 'horizontal');

    try {
      game.receiveAttack(0, 1);
      game.receiveAttack(0, 1);
    } catch (err) {}

    expect(game.board[0][1].ship.numHits).toBe(1);
    expect(game.board[0][1].ship.isSunk()).toBeFalsy();
  });

  test('Attack two ship tiles', () => {
    const game = new Gameboard();
    game.place(0, 1, 4, 'horizontal');
    game.receiveAttack(0, 1);
    game.receiveAttack(0, 2);

    expect(game.board[0][1].ship.numHits).toBe(2);
    expect(game.board[0][1].ship.isSunk()).toBeFalsy();
  });

  test('Attacking all ship tiles leads to sunken ship', () => {
    const game = new Gameboard();
    game.place(0, 1, 4, 'horizontal');
    game.receiveAttack(0, 1);
    game.receiveAttack(0, 2);
    game.receiveAttack(0, 3);
    game.receiveAttack(0, 4);

    expect(game.board[0][1].ship.numHits).toBe(4);
    expect(game.board[0][1].ship.isSunk()).toBeTruthy();
  });
});

describe('Player and CPU test', () => {
  test('create Player: Player Number 1', () => {
    const player = new Player();
    expect(player.playerID).toBe(1);
  });

  test('create CPU: Player Number 2', () => {
    const comp = new CPU();
    expect(comp.playerID).toBe(2);
  });

  test('CPU: Attacks random tile', () => {
    const comp = new CPU();
    const pl = new Player();

    comp.opponent = pl;
    pl.opponent = comp;

    const status = comp.calcAttack();
    expect(status).not.toBeFalsy();
  });

  test('CPU: places one ship randomly', () => {
    const comp = new CPU();

    comp.placeShip(5);

    expect(comp.playerGameboard.ships.length).toBe(1);
  });

  test('CPU: places five ships randomly', () => {
    const comp = new CPU();

    comp.placeShip(5);
    comp.placeShip(5);
    comp.placeShip(5);
    comp.placeShip(5);
    comp.placeShip(5);

    expect(comp.playerGameboard.ships.length).toBe(5);
  });

  test('PLAYER: places one ship success', () => {
    const pl = new Player();

    pl.placeShip(0, 0, 5, 'horizontal');

    for (let i = 0; i < 5; i++) {
      expect(pl.playerGameboard.board[0][i].ship).not.toBeFalsy();
    }

    expect(pl.playerGameboard.board[0][5].ship).toBeFalsy();
  });

  test('PLAYER: places one ship fail (does not fit)', () => {
    const pl = new Player();

    pl.placeShip(0, 8, 5, 'horizontal');

    for (let i = 8; i < 10; i++) {
      expect(pl.playerGameboard.board[0][i].ship).toBeFalsy();
    }
  });

  test('PLAYER: places two ships success', () => {
    const pl = new Player();

    pl.placeShip(0, 0, 5, 'horizontal');
    pl.placeShip(1, 0, 4, 'horizontal');

    for (let i = 0; i < 5; i++) {
      expect(pl.playerGameboard.board[0][i].ship).not.toBeFalsy();
    }
    for (let i = 0; i < 4; i++) {
      expect(pl.playerGameboard.board[1][i].ship).not.toBeFalsy();
    }
    expect(pl.playerGameboard.board[0][5].ship).toBeFalsy();
    expect(pl.playerGameboard.board[1][4].ship).toBeFalsy();
  });

  test('PLAYER: places two ships fail (overlap)', () => {
    const pl = new Player();

    pl.placeShip(0, 0, 5, 'horizontal');
    pl.placeShip(1, 0, 4, 'horizontal');

    for (let i = 0; i < 5; i++) {
      expect(pl.playerGameboard.board[0][i].ship).not.toBeFalsy();
    }
    for (let i = 0; i < 4; i++) {
      expect(pl.playerGameboard.board[1][i].ship).not.toBeFalsy();
    }
    expect(pl.playerGameboard.board[0][5].ship).toBeFalsy();
    expect(pl.playerGameboard.board[1][4].ship).toBeFalsy();
  });

  test('PLAYER: Attack tile success', () => {
    const comp = new CPU();
    const pl = new Player();

    comp.opponent = pl;
    pl.opponent = comp;

    const attack1 = pl.attackTile(0, 0);

    expect(attack1).toBe('OK');
    expect(pl.opponent.playerGameboard.board[0][0]).toEqual({
      ship: undefined,
      tileHit: true,
    });
    expect(pl.opponent.playerGameboard.board[0][1]).toEqual({
      ship: undefined,
      tileHit: false,
    });
  });

  test('PLAYER: Attack tile fail', () => {
    const comp = new CPU();
    const pl = new Player();

    comp.opponent = pl;
    pl.opponent = comp;

    const attack1 = pl.attackTile(0, 0);
    const attack2 = pl.attackTile(0, 0);

    expect(attack1).toBe('OK');
    expect(attack2).not.toBe('OK');

    expect(pl.opponent.playerGameboard.board[0][0]).toEqual({
      ship: undefined,
      tileHit: true,
    });
  });
});
