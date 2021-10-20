'use strict';

const path = require('path');

const _ = require('lodash');
const {
  Clock,
  IntRect,
  Keyboard,
  RenderWindow,
  Sprite,
  Texture,
  VideoMode,
} = require('sfml.js');

const M = 20;
const N = 10;

const field = [];
for (let i = 0; i < M; i++) {
  const arr = [];
  field.push(arr);
  for (let j = 0; j < N; j++) {
    arr.push(0);
  }
}

const figures = [
  [ 1, 3, 5, 7 ],
  [ 2, 4, 5, 7 ],
  [ 3, 5, 4, 6 ],
  [ 3, 5, 4, 7 ],
  [ 2, 3, 5, 7 ],
  [ 3, 5, 7, 6 ],
  [ 2, 3, 4, 5 ],
];
const a = [];
const b = [];
for (let i = 0; i < 4; i++) {
  a.push({ x: 0, y: 0 });
  b.push({ x: 0, y: 0 });
}

const window = new RenderWindow(new VideoMode(320, 480, 32), 'The Game!');
const t1 = new Texture();
const t2 = new Texture();
const t3 = new Texture();
const s = new Sprite();
const background = new Sprite();
const frame = new Sprite();
const clock = new Clock();

let dx = 0;
let rotate = false;
let colorNum = 1;
let timer = 0;
let delay = 0.3;

async function init() {
  await Promise.all([
    t1.loadFromFile(path.join(__dirname, 'images/tiles.png')),
    t2.loadFromFile(path.join(__dirname, 'images/background.png')),
    t3.loadFromFile(path.join(__dirname, 'images/frame.png')),
  ]);

  s.setTexture(t1);
  background.setTexture(t2);
  frame.setTexture(t3);
}

function check() {
  for (let i = 0; i < 4; i++) {
    if (a[i].x < 0 || a[i].x >= N || a[i].y >= M) {
      return false;
    } else if (field[a[i].y][a[i].x]) {
      return false;
    }
  }
  return true;
}

function copyPoint(p) {
  return JSON.parse(JSON.stringify(p));
}

function loop() {
  if (!window.isOpen()) return;

  const time = clock.getElapsedTime().asSeconds();
  clock.restart();
  timer += time;

  let e;
  while ((e = window.pollEvent())) {
    if (e.type === 'Closed') {
      window.close();
      return;
    }

    if (e.type === 'KeyPressed') {
      if (e.key.codeStr === 'Up') {
        rotate = true;
      } else if (e.key.codeStr === 'Left') {
        dx = -1;
      } else if (e.key.codeStr === 'Right') {
        dx = 1;
      }
    }
  }

  if (Keyboard.isKeyPressed('Down')) delay = 0.05;

  // Move
  for (let i = 0; i < 4; i++) {
    b[i] = copyPoint(a[i]);
    a[i].x += dx;
  }

  if (!check()) {
    for (let i = 0; i < 4; i++) {
      a[i] = copyPoint(b[i]);
    }
  }

  // Rotate
  if (rotate) {
    const p = copyPoint(a[1]);
    for (let i = 0; i < 4; i++) {
      const x = a[i].y - p.y;
      const y = a[i].x - p.x;

      a[i].x = p.x - x;
      a[i].y = p.y + y;
    }

    if (!check()) {
      for (let i = 0; i < 4; i++) {
        a[i] = copyPoint(b[i]);
      }
    }
  }

  // Tick
  if (timer > delay) {
    for (let i = 0; i < 4; i++) {
      b[i] = copyPoint(a[i]);
      a[i].y += 1;
    }

    if (!check()) {
      for (let i = 0; i < 4; i++) {
        field[b[i].y][b[i].x] = colorNum;
      }

      colorNum = _.random(1, 7, false);
      const n = _.random(0, 6, false);
      for (let i = 0; i < 4; i++) {
        a[i].x = figures[n][i] % 2;
        a[i].y = parseInt(figures[n][i] / 2);
      }
    }

    timer = 0;
  }

  // Check lines
  let k = M - 1;
  for (let i = M - 1; i > 0; i--) {
    let count = 0;
    for (let j = 0; j < N; j++) {
      if (field[i][j]) count++;
      field[k][j] = field[i][j];
    }
    if (count < N) k--;
  }

  dx = 0;
  rotate = 0;
  delay = 0.3;

  // Draw
  window.clear(0xffffffff);
  window.draw(background);
  for (let i = 0; i < M; i++) {
    for (let j = 0; j < N; j++) {
      if (field[i][j] === 0) continue;

      s.setTextureRect(new IntRect(field[i][j] * 18, 0, 18, 18));
      s.setPosition(28 + j * 18, 31 + i * 18);
      window.draw(s);
    }
  }

  for (let i = 0; i < 4; i++) {
    s.setTextureRect(new IntRect(colorNum * 18, 0, 18, 18));
    s.setPosition(28 + a[i].x * 18, 31 + a[i].y * 18);
    window.draw(s);
  }

  window.draw(frame);
  window.display();

  setTimeout(loop, 1000 / 60);
}

init().then(() => {
  clock.restart();
  loop();
});
