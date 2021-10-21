'use strict';

const path = require('path');

const {
  Clock,
  Keyboard,
  RenderWindow,
  Sprite,
  Texture,
  VideoMode,
} = require('sfml.js');

const Ball = require('./ball');
const Board = require('./board');
const Bricks = require('./bricks');
const FPSText = require('./fps_text');

class Game {
  constructor() {
    this.window = new RenderWindow(new VideoMode(Game.WINDOW_WIDTH, Game.WINDOW_HEIGHT, 32), 'Breakout!', 5);
    this.clock = new Clock();
  }

  async init() {
    this.window.setFramerateLimit(60);
    this.window.setVerticalSyncEnabled(true);

    this.ball = new Ball();
    this.board = new Board();
    this.bricks = new Bricks();
    this.fpsText = new FPSText();

    this.backgroundTexture = new Texture();

    await Promise.all([
      this.backgroundTexture.loadFromFile(path.join(__dirname, 'images/starry.jpeg')),
      this.ball.init(),
      this.bricks.init(),
      this.board.init(),
    ]);

    const backgroundTextureSize = this.backgroundTexture.getSize();
    this.background = new Sprite(this.backgroundTexture);
    this.background.setScale(Game.WINDOW_WIDTH / backgroundTextureSize.x, Game.WINDOW_HEIGHT / backgroundTextureSize.y);
    this.background.setPosition(0, 0);

    this.state = 'READY';

    this.scenes = {};
    this.currentScene;

    this.switchTo('ready_scene');
  }

  switchTo(name) {
    let scene = this.scenes[name];
    if (!scene) {
      this.scenes[name] = scene = new (require(`./scene/${name}`))(this);
    }

    this.currentScene = scene;
    scene.enter();
  }

  frame(deltaTime, events) {
    for (const event of events) {
      switch (event.type) {
        case 'Closed': {
          this.window.close();
          break;
        }

        default: {
          break;
        }
      }
    }

    if (Keyboard.isKeyPressed('Escape')) {
      this.window.close();
    }

    if (!this.window.isOpen()) return;

    this.fpsText.calcFPS(deltaTime);
    this.currentScene.frame(deltaTime, events);
  }

  render() {
    this.currentScene.render();
  }

  run() {
    const dt = this.clock.getElapsedTime();
    this.clock.restart();

    if (!this.window.isOpen()) return;

    const events = [];
    let ev;
    while ((ev = this.window.pollEvent())) {
      events.push(ev);
    }

    this.frame(dt, events);
    if (!this.window.isOpen()) return;
    this.render();

    setImmediate(this.run.bind(this));
  }
}

Game.FPS = 120;
Game.WINDOW_WIDTH = 1024;
Game.WINDOW_HEIGHT = 768;

module.exports = Game;
