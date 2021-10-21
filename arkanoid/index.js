'use strict';

const path = require('path');

const _ = require('lodash');
const {
  Clock,
  FloatRect,
  Font,
  Keyboard,
  RenderWindow,
  Sprite,
  Text,
  Texture,
  VideoMode,
} = require('sfml.js');

const window = new RenderWindow(new VideoMode(520, 450), 'Arkanoid!');
window.setFramerateLimit(60);

const clock = new Clock();
const font = new Font();
font.loadFromFile(path.join(__dirname, '../breakout/font.ttf'));
const text = new Text('FPS: -', font, 15);
text.setPosition(320, 20);
text.setFillColor(0xff7800ff);

const t1 = new Texture();
const t2 = new Texture();
const t3 = new Texture();
const t4 = new Texture();
const sBackground = new Sprite();
const sBall = new Sprite();
const sPaddle = new Sprite();
const block = [];
let dx = 6;
let dy = 5;
let x = 300;
let y = 300;

async function load() {
  await Promise.all([
    t1.loadFromFile(path.join(__dirname, 'images/block01.png')),
    t2.loadFromFile(path.join(__dirname, 'images/background.jpg')),
    t3.loadFromFile(path.join(__dirname, 'images/ball.png')),
    t4.loadFromFile(path.join(__dirname, 'images/paddle.png')),
  ]);

  sBackground.setTexture(t2);
  sBall.setTexture(t3);
  sPaddle.setTexture(t4);
  sPaddle.setPosition(300, 440);

  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      const s = new Sprite(t1);
      s.setPosition(i * 43, j * 20);
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
    if (e.type === 'Closed') {
      window.close();
      return;
    }
  }

  x += dx;
  for (let i = 0; i < block.length; i++) {
    if ((new FloatRect(x + 3, y + 3, 6, 6)).intersects(block[i].getGlobalBounds())) {
      block[i].setPosition(-100, 0);
      dx = -dx;
    }
  }

  y += dy;
  for (let i = 0; i < block.length; i++) {
    if ((new FloatRect(x + 3, y + 3, 6, 6)).intersects(block[i].getGlobalBounds())) {
      block[i].setPosition(-100, 0);
      dy = -dy;
    }
  }

  if (x < 0 || x > 520) dx = -dx;
  if (y < 0 || y > 450) dy = -dy;

  if (Keyboard.isKeyPressed('Right')) sPaddle.move(6, 0);
  if (Keyboard.isKeyPressed('Left')) sPaddle.move(-6, 0);

  if ((new FloatRect(x, y, 12, 12)).intersects(sPaddle.getGlobalBounds())) {
    dy = -_.random(2, 6, false);
  }

  sBall.setPosition(x, y);

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
