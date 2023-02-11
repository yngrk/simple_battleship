import { checkGameOver, checkHit, cpuAttack, initGame } from './controller';

const body = document.querySelector('body');

const playerContainer = document.querySelector(
  'section.game-container .player-board'
);
const cpuContainer = document.querySelector(
  'section.game-container .cpu-board'
);
const messageBoard = document.querySelector(
  'section.game-container .message-box'
);

const shipsToPlace = [
  { length: 2 },
  { length: 3 },
  { length: 4 },
  { length: 4 },
  { length: 5 },
];

const placedShips = [];
let align = 'horizontal';
let status = 'good';

export function displayMessage(message) {
  messageBoard.textContent = message;
}

// EventListeners
export function initPlacementEvents() {
  playerContainer.childNodes.forEach((node) => {
    node.addEventListener('mouseover', showPlacementPreview);
    node.addEventListener('mouseout', clearPreview);
    node.addEventListener('click', placeTiles);
  });
}

export function initAttackEvents() {
  cpuContainer.childNodes.forEach((node) => {
    node.addEventListener('mouseover', showAttackPreview);
    node.addEventListener('mouseout', clearAttackPreview);
    node.addEventListener('click', executeAttack);
  });
}

// DOM INIT
export function createPlayerGrid() {
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      const tile = document.createElement('div');
      tile.dataset.x = j;
      tile.dataset.y = i;
      playerContainer.appendChild(tile);
    }
  }
}
export function createCPUGrid() {
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      const tile = document.createElement('div');
      tile.dataset.x = j;
      tile.dataset.y = i;
      cpuContainer.appendChild(tile);
    }
  }
}

// Alignment Button
export function showAlignBtn() {
  const btn = document.createElement('button');
  btn.textContent = 'Vertical / Horizontal';
  btn.classList.add('alignment-btn');
  btn.addEventListener('click', toggleAlignment);
  body.appendChild(btn);
}

export function toggleAlignBtn() {
  const btn = document.querySelector('.alignment-btn');
  btn.disabled = btn.disabled ? false : true;
}

function toggleAlignment() {
  align = align === 'horizontal' ? 'vertical' : 'horizontal';
}

// Attack related
function showAttackPreview(event) {
  status = 'good';
  const tile = event.target;

  if (tile.classList.contains('miss')) status = 'bad';
  if (tile.classList.contains('hit')) status = 'bad';
  if (tile.classList.contains('sunk')) status = 'bad';

  tile.classList.add(`hoverSelect-${status}`);
}

function clearAttackPreview(event) {
  const tile = event.target;
  tile.classList.remove('hoverSelect-good');
  tile.classList.remove('hoverSelect-bad');
}

function executeAttack(event) {
  if (status === 'bad') return;

  const tile = event.target;
  const tileInfo = { x: tile.dataset.x, y: tile.dataset.y };
  const hit = checkHit(tileInfo);

  if (hit === 0) {
    tile.classList.add('miss');
  } else if (hit === 1) {
    tile.classList.add('hit');
  } else {
    // ship is sunk so we get the coordinates of the shipTiles
    hit.forEach((shipTile) => {
      const xVal = shipTile.x;
      const yVal = shipTile.y;

      cpuContainer.childNodes.forEach((node) => {
        if (
          Number(node.dataset.x) === xVal &&
          Number(node.dataset.y) === yVal
        ) {
          node.classList.add('sunk');
        }
      });
    });
    checkGameOver('player');
  }
  cpuAttack();
  status = 'bad';
}

export function updateCPUAttack(attackData) {
  const xVal = Number(attackData.x);
  const yVal = Number(attackData.y);
  const hit = attackData.hit;

  const status = hit ? 'hit' : 'miss';

  // apply class
  playerContainer.childNodes.forEach((node) => {
    const nodeY = Number(node.dataset.x);
    const nodeX = Number(node.dataset.y);

    if (nodeX === xVal && nodeY === yVal) {
      node.classList.add(`${status}`);
    }
  });

  // check if ship sunk
  if (attackData.sunken) {
    const tiles = attackData.tiles;
    playerContainer.childNodes.forEach((node) => {
      tiles.forEach((tile) => {
        if (
          Number(node.dataset.y) === Number(tile.x) &&
          Number(node.dataset.x) === Number(tile.y)
        ) {
          node.classList.add('sunk');
        }
      });
    });
  }

  checkGameOver('cpu');
}

// placement hover preview
function showPlacementPreview(event) {
  status = 'good';
  const tile = event.target;

  if (shipsToPlace.length === 0) return;

  const length = shipsToPlace[shipsToPlace.length - 1].length;

  if (align === 'vertical') {
    const selected = Array.from(playerContainer.childNodes).filter((node) => {
      if (node.dataset.x !== tile.dataset.x) return false;
      if (Number(node.dataset.y) < Number(tile.dataset.y)) return false;
      if (Number(node.dataset.y) >= Number(tile.dataset.y) + length)
        return false;
      return true;
    });

    if (Number(tile.dataset.y) + length > 10) status = 'bad';
    selected.forEach((node) => {
      if (node.classList.contains('placed')) status = 'bad';
    });

    selected.forEach((node) => {
      node.classList.add(`hoverSelect-${status}`);
    });
  }
  if (align === 'horizontal') {
    const selected = Array.from(playerContainer.childNodes).filter((node) => {
      if (node.dataset.y !== tile.dataset.y) return false;
      if (Number(node.dataset.x) < Number(tile.dataset.x)) return false;
      if (Number(node.dataset.x) >= Number(tile.dataset.x) + length)
        return false;
      return true;
    });

    if (Number(tile.dataset.x) + length > 10) status = 'bad';
    selected.forEach((node) => {
      if (node.classList.contains('placed')) status = 'bad';
    });

    selected.forEach((node) => {
      node.classList.add(`hoverSelect-${status}`);
    });
  }
}

function clearPreview() {
  playerContainer.childNodes.forEach((node) => {
    node.classList.remove('hoverSelect-good');
    node.classList.remove('hoverSelect-bad');
  });
}

// Tile placement logic
function placeTiles(event) {
  const tile = event.target;

  // if all ships placed exit
  if (shipsToPlace.length === 0) return;

  // no valid location for placement, exit function
  if (status === 'bad') return;

  const ship = {
    origin: { x: tile.dataset.y, y: tile.dataset.x },
    alignment: align,
    length: shipsToPlace[shipsToPlace.length - 1].length,
    tiles: [],
  };

  placedShips.push(ship);

  // placement location valid, mark and save tiless
  playerContainer.childNodes.forEach((node) => {
    if (node.classList.contains('hoverSelect-good')) {
      node.classList.add('placed');
      ship.tiles.push({ x: node.dataset.x, y: node.dataset.y });
    }
  });

  // ship has been placed
  shipsToPlace.pop();

  status = 'bad';

  if (shipsToPlace.length === 0) setStage();
}

// if all ships has been placed rebuild UI with markings
// setup of playerField ends and no new ships will be placed
// initiate next phase of game
function setStage() {
  // remove all DOM elements to get rid of event listeners
  while (playerContainer.hasChildNodes()) {
    playerContainer.removeChild(playerContainer.firstChild);
  }

  // recreate Grid
  createPlayerGrid();

  // place visual marks
  playerContainer.childNodes.forEach((node) => {
    placedShips.forEach((ship) => {
      ship.tiles.forEach((tile) => {
        if (node.dataset.x === tile.x && node.dataset.y === tile.y)
          node.classList.add('placed');
      });
    });
  });

  // disable button
  toggleAlignBtn();

  // now stage is set. Game can start
  initGame();
}

export function getPlacedShips() {
  return placedShips;
}

export function disableGameView() {
  cpuContainer.childNodes.forEach((node) => {
    node.removeEventListener('mouseover', showAttackPreview);
    node.removeEventListener('mouseout', clearAttackPreview);
    node.removeEventListener('click', executeAttack);

    node.classList.remove('hoverSelect-good');
    node.classList.remove('hoverSelect-bad');
  });
}
