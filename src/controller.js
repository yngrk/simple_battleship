import { CPU, Player } from './factory';
import {
  createCPUGrid,
  createPlayerGrid,
  disableGameView,
  displayMessage,
  getPlacedShips,
  initAttackEvents,
  initPlacementEvents,
  showAlignBtn,
  updateCPUAttack,
} from './view';

let player;
let cpu;

export function launchGame() {
  player = new Player();
  cpu = new CPU();

  player.opponent = cpu;
  cpu.opponent = player;

  // build grids
  createPlayerGrid();
  createCPUGrid();

  displayMessage('Place Ships');

  // player ships placement phase
  initPlacementEvents();
  showAlignBtn();
}

export function initGame() {
  const getShips = getPlacedShips();
  getShips.forEach((ship) => {
    player.playerGameboard.place(
      ship.origin.x,
      ship.origin.y,
      ship.length,
      ship.alignment
    );
  });

  cpu.placeShip(5);
  cpu.placeShip(4);
  cpu.placeShip(4);
  cpu.placeShip(3);
  cpu.placeShip(2);

  startGame();
}

export function checkHit(obj) {
  const xVal = Number(obj.x);
  const yVal = Number(obj.y);

  const ship = cpu.playerGameboard.board[xVal][yVal].ship;

  if (!ship) {
    displayMessage('MISS');
    return 0;
  }

  // not a miss so attack hits!
  cpu.playerGameboard.receiveAttack(xVal, yVal);

  // check if ship is hit but not sunken
  if (ship.numHits < ship.length) {
    displayMessage('HIT!');
    return 1;
  }

  // ship is sunken return obj with all tileData of ship
  const tiles = [];
  const len = Number(ship.length);

  if (ship.origin.align === 'horizontal')
    for (let i = 0; i < len; i++)
      tiles.push({ x: ship.origin.x, y: Number(ship.origin.y) + i });
  if (ship.origin.align === 'vertical')
    for (let i = 0; i < len; i++)
      tiles.push({ x: Number(ship.origin.x) + i, y: ship.origin.y });

  displayMessage('SHIP INNSMOUTHED!');

  return tiles;
}

export function checkGameOver(winner) {
  if (winner === 'player') {
    // check
    if (!cpu.playerGameboard.allShipsSunk()) return 0;
    // end game winner player
    displayMessage('PLAYER WINS');
    endGame();
  } else if (winner === 'cpu') {
    // check
    if (!player.playerGameboard.allShipsSunk()) return 0;
    // end game winner cpu
    displayMessage('CPU WINS');
    endGame();
  }
}

function startGame() {
  displayMessage('Attack!');
  initAttackEvents();
}

function endGame() {
  disableGameView();
}

export function cpuAttack() {
  const attackData = cpu.calcAttack();
  const xVal = Number(attackData.x);
  const yVal = Number(attackData.y);
  const ship = player.playerGameboard.board[xVal][yVal].ship;

  if (!ship) attackData.hit = false;
  else {
    attackData.hit = true;
    // check if sunken
    if (ship.isSunk()) {
      attackData.sunken = true;
      attackData.tiles = [];
      if (ship.origin.align === 'horizontal') {
        for (let i = 0; i < ship.length; i++)
          attackData.tiles.push({
            x: ship.origin.x,
            y: Number(ship.origin.y) + i,
          });
      }
      if (ship.origin.align === 'vertical') {
        for (let i = 0; i < ship.length; i++)
          attackData.tiles.push({
            y: ship.origin.y,
            x: Number(ship.origin.x) + i,
          });
      }
    }
  }
  updateCPUAttack(attackData);
}
