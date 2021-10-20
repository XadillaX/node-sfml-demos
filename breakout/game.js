'use strict';

const {
  Clock,
  Keyboard,
  RenderWindow,
  VideoMode,
} = require('sfml.js');

const Ball = require('./ball');
const Board = require('./board');
const Bricks = require('./bricks');
const FPSText = require('./fps_text');

class Game {
  constructor() {
    this.window = new RenderWindow(new VideoMode(Game.WINDOW_WIDTH, Game.WINDOW_HEIGHT, 32), 'Breakout', 5);
    this.clock = new Clock();
    this.innerClock = new Clock();
  }

  init() {
    this.ball = new Ball();
    this.board = new Board();
    this.bricks = new Bricks();
    this.fpsText = new FPSText();

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
    this.innerClock.restart();

    if (!this.window.isOpen()) return;

    const events = [];
    let ev;
    while ((ev = this.window.pollEvent())) {
      events.push(ev);
    }

    this.frame(dt, events);
    if (!this.window.isOpen()) return;
    this.render();

    const newDT = this.innerClock.getElapsedTime();

    const need = 1000 / Game.FPS;
    let next = need - newDT.asMilliseconds();
    if (next < 0) next = 0;

    setTimeout(this.run.bind(this), next);
  }
}

Game.FPS = 120;
Game.WINDOW_WIDTH = 1024;
Game.WINDOW_HEIGHT = 768;

module.exports = Game;
