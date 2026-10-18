'use strict';

const path = require('path');

const _ = require('lodash');
const {
  Clock,
  Color,
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

const window = new RenderWindow(new VideoMode(new Vector2u(400, 533)), 'Doodle Game!');
window.setFramerateLimit(60);

const clock = new Clock();
const font = new Font();
const text = new Text({ string: 'FPS: -', font, characterSize: 15 });
text.setPosition(new Vector2f(320, 20));
text.setFillColor(new Color(0xff7800ff));

const t1 = new Texture();
const t2 = new Texture();
const t3 = new Texture();
let sBackground;
let sPlat;
let sPers;
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
    font.openFromFile(path.join(__dirname, '../breakout/font.ttf')),
    t1.loadFromFile(path.join(__dirname, 'images/background.png')),
    t2.loadFromFile(path.join(__dirname, 'images/platform.png')),
    t3.loadFromFile(path.join(__dirname, 'images/doodle.png')),
  ]);

  sBackground = new Sprite(t1);
  sPlat = new Sprite(t2);
  sPers = new Sprite(t3);
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

  if (Keyboard.isKeyPressed(Keyboard.Key.Right)) x += 3;
  if (Keyboard.isKeyPressed(Keyboard.Key.Left)) x -= 3;

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

  sPers.setPosition(new Vector2f(x, y));

  window.clear();
  window.draw(sBackground);
  window.draw(sPers);
  for (let i = 0; i < 10; i++) {
    sPlat.setPosition(new Vector2f(plat[i].x, plat[i].y));
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
