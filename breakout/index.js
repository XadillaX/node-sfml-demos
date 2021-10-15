'use strict';

const {
  CircleShape,
  Clock,
  Keyboard,
  RectangleShape,
  RenderWindow,
  Vector2F,
  VideoMode,
} = require('sfml.js');

const videoMode = new VideoMode(1024, 768, 32);
const window = new RenderWindow(videoMode, 'Breakout', 5);
const clock = new Clock();
const innerClock = new Clock();

let spacePressed = false;
let leftPressed = false;
let rightPressed = false;

const BOARD_HEIGHT = 20;
const BOARD_WIDTH = 100;
let boardX = 512;
const boardY = 700;
const board = new RectangleShape({ x: BOARD_WIDTH, y: BOARD_HEIGHT });
const boardSpeed = 1024;
board.setPosition((boardX - (BOARD_WIDTH / 2)), boardY);

const BALL_RADIUS = 12;
const ball = new CircleShape(12, 30);
const ballVector = new Vector2F(0, 0);
const ballSpeed = 512;
let ballX = 512;
let ballY = 690;
ball.setPosition(ballX - BALL_RADIUS, ballY - BALL_RADIUS);

let state = 'READY';

const bricks = [];
const bricksDisplay = [];
for (let i = 0; i < 10; i++) {
  for (let j = 0; j < 10; j++) {
    const brick = new RectangleShape({ x: BOARD_WIDTH, y: BOARD_HEIGHT });
    brick.setPosition({ x: 3 + (102 * i), y: 3 + (23 * j) });
    bricks.push(brick);
    bricksDisplay.push(true);
  }
}

function inReady() {
  if (!leftPressed && !rightPressed && !spacePressed) {
    return;
  }

  state = 'PLAY';

  if ((spacePressed || leftPressed || rightPressed) && ballVector.x === 0 && ballVector.y === 0) {
    if (spacePressed) {
      ballVector.y = -1;
    } else if (rightPressed) {
      ballVector.x = Math.sqrt(0.5);
      ballVector.y = -(Math.sqrt(0.5));
    } else {
      ballVector.x = -Math.sqrt(0.5);
      ballVector.y = -(Math.sqrt(0.5));
    }
  }
}

/**
 * Rectangle / Circle intersect
 * TODO: faster algorithm.
 * @param {RectangleShape} rect The rectangle
 * @param {CircleShape} circle The circle
 * @return {boolean} intersect or not
 */
function rectCircleIntersect(rect, circle) {
  const pointCount = circle.getPointCount();
  const { width: boundsX, height: boundsY } = circle.getLocalBounds();
  const bounds = rect.getGlobalBounds();
  const { x, y } = circle.getPosition();
  for (let i = 0; i < pointCount; i++) {
    const point = circle.getPoint(i);
    const { x: pointX, y: pointY } = point;
    point.x += x;
    point.y += y;

    if (bounds.contains(point)) {
      if (pointX < boundsX / 3) {
        if (pointY < boundsY / 3) {
          return 'LT';
        } else if (pointY < (boundsY / 3) * 2) {
          return 'LM';
        }

        return 'LB';
      } else if (pointX < (boundsX / 3) * 2) {
        if (pointY < boundsY / 3) {
          return 'MT';
        } else if (pointY < (boundsY / 3) * 2) {
          return 'MM';
        }

        return 'MB';
      }

      if (pointY < boundsY / 3) {
        return 'RT';
      } else if (pointY < (boundsY / 3) * 2) {
        return 'RM';
      }

      return 'RB';
    }
  }

  return false;
}

function inPlaying(deltaTime) {
  const deltaX = boardSpeed * deltaTime.asSeconds();
  if (leftPressed) {
    boardX -= deltaX;
    if (boardX < BOARD_WIDTH / 2) boardX = BOARD_WIDTH / 2;
  } else if (rightPressed) {
    boardX += deltaX;
    if (boardX > 1024 - (BOARD_WIDTH / 2)) boardX = 1024 - (BOARD_WIDTH / 2);
  }
  board.setPosition((boardX - (BOARD_WIDTH / 2)), boardY);

  const origBallY = ballY;
  ballX += (ballVector.x * ballSpeed * deltaTime.asSeconds());
  ballY += (ballVector.y * ballSpeed * deltaTime.asSeconds());

  if (ballX < BALL_RADIUS) {
    ballX = BALL_RADIUS;
    ballVector.x = -ballVector.x;
  } else if (ballX > 1024 - BALL_RADIUS) {
    ballX = 1024 - BALL_RADIUS;
    ballVector.x = -ballVector.x;
  }

  if (ballY < BALL_RADIUS) {
    ballY = BALL_RADIUS;
    ballVector.y = -ballVector.y;
  } else if (ballY > 768 - BALL_RADIUS) {
    ballY = 768 - BALL_RADIUS;
    ballVector.y = -ballVector.y;
  }

  if (ballY - 690 >= 0 && ballY - 690 <= Math.max(5, ballY - origBallY)) {
    if (ballX >= boardX - BOARD_WIDTH / 2 && ballX <= boardX + BOARD_WIDTH / 2) {
      // hit board
      const deltaXRate = Math.abs(ballX - boardX) / (BOARD_WIDTH / 2);
      const vectorY = Math.sqrt((1 - deltaXRate));
      ballVector.y = -vectorY;
      ballVector.x = ballX < boardX ? -deltaXRate : deltaXRate;
    }
  }

  if (ballY - 690 > Math.max(5, ballY - origBallY) && ballVector.y > 0) {
    state = 'DONE';
  }

  let direction = false;
  for (let i = 0; i < bricks.length; i++) {
    if (bricksDisplay[i]) {
      let _direction;
      if ((_direction = rectCircleIntersect(bricks[i], ball))) {
        if (_direction) direction = _direction;
        bricksDisplay[i] = false;
      }
    }
  }

  if (direction) {
    console.log(direction);
  }

  switch (direction) {
    case 'LB':
    case 'RB':
    case 'RT':
    case 'LT': ballVector.x = -ballVector.x; ballVector.y = -ballVector.y; break;

    case 'MB':
    case 'MT': ballVector.y = -ballVector.y; break;

    case 'RM':
    case 'LM': ballVector.x = -ballVector.x; break;

    case 'MM':
    default: break;
  }

  ball.setPosition(ballX - BALL_RADIUS, ballY - BALL_RADIUS);
}

function done() {
  ball.setFillColor(0xff0000ff);
  board.setFillColor(0xff0000ff);

  if (spacePressed) {
    ball.setFillColor(0xffffffff);
    board.setFillColor(0xffffffff);

    boardX = 512;

    ballX = 512;
    ballY = 690;

    ballVector.x = ballVector.y = 0;

    board.setPosition((boardX - (BOARD_WIDTH / 2)), boardY);
    ball.setPosition(ballX - BALL_RADIUS, ballY - BALL_RADIUS);

    for (let i = 0; i < bricksDisplay.length; i++) bricksDisplay[i] = true;

    state = 'READY';
  }
}

async function frame(deltaTime, events) {
  spacePressed = leftPressed = rightPressed = false;

  for (const event of events) {
    switch (event.type) {
      case 'Closed': {
        window.close();
        break;
      }

      default: {
        break;
      }
    }
  }

  if (Keyboard.isKeyPressed('Escape')) {
    window.close();
  }

  if (Keyboard.isKeyPressed('A') || Keyboard.isKeyPressed('Left')) {
    leftPressed = true;
  }

  if (Keyboard.isKeyPressed('D') || Keyboard.isKeyPressed('Right')) {
    rightPressed = true;
  }

  if (Keyboard.isKeyPressed('Space')) {
    spacePressed = true;
  }

  if (!window.isOpen()) return;

  if (!(leftPressed ^ rightPressed)) {  // eslint-disable-line
    leftPressed = rightPressed = false;
  }

  switch (state) {
    case 'READY': inReady(); break;
    case 'PLAY': inPlaying(deltaTime); break;
    case 'DONE': done(); break;
    default: break;
  }
}

async function render() {
  window.clear();
  window.draw(board);
  window.draw(ball);

  for (let i = 0; i < bricks.length; i++) {
    if (bricksDisplay[i]) window.draw(bricks[i]);
  }

  window.display();
}

async function loop() {
  const dt = clock.getElapsedTime();
  clock.restart();
  innerClock.restart();

  if (!window.isOpen()) return;

  const events = [];
  let ev;
  while ((ev = window.pollEvent())) {
    events.push(ev);
  }

  await frame(dt, events);
  if (!window.isOpen()) return;

  await render();

  const newDT = innerClock.getElapsedTime();

  const need = 1000 / 240;
  let next = need - newDT.asMilliseconds();
  if (next < 0) next = 0;

  setTimeout(loop, next);
}

setTimeout(loop, 1000 / 240);
