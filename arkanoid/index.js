'use strict';

const path = require('path');

const _ = require('lodash');
const {
  Clock,
  Color,
  FloatRect,
  Font,
  Keyboard,
  RenderWindow,
  Sprite,
  Text,
  Texture,
  Vector2f,
  Vector2u,
  VideoMode,
} = require('sfml.js');

const window = new RenderWindow(new VideoMode(new Vector2u(520, 450)), 'Arkanoid!');
window.setFramerateLimit(60);

const clock = new Clock();
const font = new Font();
const text = new Text({ string: 'FPS: -', font, characterSize: 15 });
text.setPosition(new Vector2f(320, 20));
text.setFillColor(new Color(0xff7800ff));

const t1 = new Texture();
const t2 = new Texture();
const t3 = new Texture();
const t4 = new Texture();
let sBackground;
let sBall;
let sPaddle;
const block = [];
let dx = 6;
let dy = 5;
let x = 300;
let y = 300;

async function load() {
  await Promise.all([
    font.openFromFile(path.join(__dirname, '../breakout/font.ttf')),
    t1.loadFromFile(path.join(__dirname, 'images/block01.png')),
    t2.loadFromFile(path.join(__dirname, 'images/background.jpg')),
    t3.loadFromFile(path.join(__dirname, 'images/ball.png')),
    t4.loadFromFile(path.join(__dirname, 'images/paddle.png')),
  ]);

  sBackground = new Sprite(t2);
  sBall = new Sprite(t3);
  sPaddle = new Sprite(t4);
  sPaddle.setPosition(new Vector2f(300, 440));

  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      const s = new Sprite(t1);
      s.setPosition(new Vector2f(i * 43, j * 20));
      block.push(s);
    }
  }
}

function loop() {
  if (!window.isOpen()) return;

  const time = clock.getElapsedTime().asMilliseconds();
  clock.restart();
  text.setString(`FPS: ${(1000 / time).toFixed(0)}`);

  let e;
  while ((e = window.pollEvent())) {
    if (e.kind === 'Closed') {
      window.close();
      return;
    }
  }

  x += dx;
  for (let i = 0; i < block.length; i++) {
    if ((new FloatRect(new Vector2f(x + 3, y + 3), new Vector2f(6, 6))).findIntersection(block[i].getGlobalBounds())) {
      block[i].setPosition(new Vector2f(-100, 0));
      dx = -dx;
    }
  }

  y += dy;
  for (let i = 0; i < block.length; i++) {
    if ((new FloatRect(new Vector2f(x + 3, y + 3), new Vector2f(6, 6))).findIntersection(block[i].getGlobalBounds())) {
      block[i].setPosition(new Vector2f(-100, 0));
      dy = -dy;
    }
  }

  if (x < 0 || x > 520) dx = -dx;
  if (y < 0 || y > 450) dy = -dy;

  if (Keyboard.isKeyPressed(Keyboard.Key.Right)) sPaddle.move(new Vector2f(6, 0));
  if (Keyboard.isKeyPressed(Keyboard.Key.Left)) sPaddle.move(new Vector2f(-6, 0));

  if ((new FloatRect(new Vector2f(x, y), new Vector2f(12, 12))).findIntersection(sPaddle.getGlobalBounds())) {
    dy = -_.random(2, 6, false);
  }

  sBall.setPosition(new Vector2f(x, y));

  window.clear();
  window.draw(sBackground);
  window.draw(sBall);
  window.draw(sPaddle);

  for (let i = 0; i < block.length; i++) {
    window.draw(block[i]);
  }

  window.draw(text);
  window.display();

  setImmediate(loop);
}

load().then(() => {
  loop();
});
