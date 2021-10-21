'use strict';

const path = require('path');

const _ = require('lodash');
const {
  Clock,
  Font,
  Keyboard,
  RenderWindow,
  Sprite,
  Text,
  Texture,
  VideoMode,
} = require('sfml.js');

const window = new RenderWindow(new VideoMode(400, 533), 'Doodle Game!');
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
const sBackground = new Sprite();
const sPlat = new Sprite();
const sPers = new Sprite();
const plat = [];
let x = 100;
let y = 100;
const h = 200;
let dy = 0;

for (let i = 0; i < 20; i++) {
  plat.push({ x: 0, y: 0 });
}

async function load() {
  await Promise.all([
    t1.loadFromFile(path.join(__dirname, 'images/background.png')),
    t2.loadFromFile(path.join(__dirname, 'images/platform.png')),
    t3.loadFromFile(path.join(__dirname, 'images/doodle.png')),
  ]);

  sBackground.setTexture(t1);
  sPlat.setTexture(t2);
  sPers.setTexture(t3);
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

  if (Keyboard.isKeyPressed('Right')) x += 3;
  if (Keyboard.isKeyPressed('Left')) x -= 3;

  dy += 0.2;
  y += dy;
  if (y > 500) dy = -10;
  if (y < h) {
    for (let i = 0; i < 10; i++) {
      y = h;
      plat[i].y -= dy;
      if (plat[i].y > 533) {
        plat[i].y = 0;
        plat[i].x = _.random(0, 399, false);
      }
    }
  }

  for (let i = 0; i < 10; i++) {
    if ((x + 50 > plat[i].x) && (x + 20 < plat[i].x + 68) &&
        (y + 70 > plat[i].y) && (y + 70 < plat[i].y + 14) && (dy > 0)) {
      dy = -10;
    }
  }

  sPers.setPosition(x, y);

  window.clear();
  window.draw(sBackground);
  window.draw(sPers);
  for (let i = 0; i < 10; i++) {
    sPlat.setPosition(plat[i].x, plat[i].y);
    window.draw(sPlat);
  }
  window.draw(text);
  window.display();

  setImmediate(loop);
}

load().then(() => {
  for (let i = 0; i < 10; i++) {
    plat[i].x = _.random(0, 399, false);
    plat[i].y = _.random(0, 532, false);
  }

  loop();
});
