'use strict';

const path = require('path');

const { Clock, Font, Keyboard, Mouse } = require('sfml.js');

const Animator = require('./animator');
const BombManager = require('./bomb_manager');
const GUI = require('./gui');
const Level = require('./level');
const LevelView = require('./level_view');
const PhysicsEngine = require('./physics_engine');
const Player = require('./player');
const TextureAtlas = require('./texture_atlas');

const TILE_SIZE = 64;
const RESOURCE_PATHS = [
  'data/sample_level.txt',
  'data/Cat.ttf',
  'data/sample_terraintextures.png',
  'data/sample_bombtextures.png',
  'data/sample_raytextures.png',
  'data/playersheets.png',
];

// https://github.com/PiGames/Bomberman/blob/master/Bomberman/Game.cpp
class Game {
  constructor(window) {
    this.window = window;

    const windowSize = window.getSize();
    this.windowWidth = windowSize.x;
    this.windowHeight = windowSize.y;

    this.physicsEngine = new PhysicsEngine();
    this.bombManager = new BombManager();
    this.clock = new Clock();
    this.level = new Level();
    this.levelView = new LevelView();

    this.players = [ new Player(), new Player() ];
    this.playersAnimators = [ new Animator(), new Animator() ];

    this.gui = new GUI();
    this.atlases = [];
    for (let i = 0; i < 4; i++) {
      this.atlases.push(new TextureAtlas());
    }

    this.enterMenu = true;
    this.numberOfRespawns = 0;
    this.numberOfPlayers = 2;
    this.font = new Font();
    this.pause = false;

    this.out = {
      enterMenu: true,
      exit: false,
      playAgain: false,
    };
  }

  async initGamePlay(lvlPath) {
    lvlPath = path.join(__dirname, lvlPath);

    for (const player of this.players) {
      player.deleteBomb();
    }

    if (!(await this.level.loadFromFile(lvlPath))) {
      process.exit(4);
    }

    this.levelView.setLevel(this.level, this.atlases[0]);
    this.level.setLevelView(this.levelView);

    for (let i = 0; i < this.players.length; i++) {
      this.playersAnimators[i].addAnimationState(
        'EAST_WITH_BOMB',
        this.atlases[3],
        0,
        5
      );
      this.playersAnimators[i].addAnimationState(
        'NORTH_WITH_BOMB',
        this.atlases[3],
        6,
        11
      );
      this.playersAnimators[i].addAnimationState(
        'EAST',
        this.atlases[3],
        12,
        16
      );
      this.playersAnimators[i].addAnimationState(
        'NORTH',
        this.atlases[3],
        17,
        20
      );
      this.playersAnimators[i].addAnimationState(
        'SOUTH',
        this.atlases[3],
        21,
        26
      );
      this.playersAnimators[i].addAnimationState(
        'SOUTH_WITH_BOMB',
        this.atlases[3],
        27,
        32
      );
      this.playersAnimators[i].addAnimationState(
        'WEST_WITH_BOMB',
        this.atlases[3],
        33,
        38
      );
      this.playersAnimators[i].addAnimationState(
        'WEST',
        this.atlases[3],
        39,
        43
      );
      this.playersAnimators[i].setLoop(true);

      this.players[i].setAnimator(
        this.playersAnimators[i],
        this.atlases[3].getCellSizeX(),
        this.atlases[3].getCellSizeY() - 5
      );
      this.playersAnimators[i].stop();
      this.playersAnimators[i].setDelayBetweenFrames(0.1);
      this.players[i].setRespawns(3);
      this.players[i].setUpBomb(this.atlases[1], this.atlases[2]);
      this.players[i].setLevel(this.level);

      if (!i) {
        this.playersAnimators[i].changeActiveState('EAST_WITH_BOMB');
        this.players[i].setRespawnPosition(1, 1);
      } else {
        this.playersAnimators[i].changeActiveState('WEST_WITH_BOMB');
        this.players[i].setRespawnPosition(
          this.level.getWidth() - 2,
          this.level.getHeight() - 2
        );
      }

      this.players[i].setAfterRespawnSafeTime(2.5);
      this.players[i].spawn();
      this.players[i].setColor(i);
    }

    for (let i = 0; i < this.players.length; i++) {
      this.players[i].update(0);
      this.players[i].setWin(false);
      this.players[i].setRespawns(this.numberOfRespawns);
      this.players[i].setAlive();
    }

    this.endOfGame = false;
    this.out.playAgain = false;

    this.physicsEngine.init(this.level, this.players);
    this.bombManager.init(this.level, this.players);
  }

  async init(musicVolumn, soundVolumn, numberOfLives) {
    console.log(
      `Music Volumn: ${musicVolumn}, Sound Volumn: ${soundVolumn},` +
        ` Number of Respawns: ${numberOfLives}`
    );
    this.numberOfRespawns = numberOfLives;

    this.font.loadFromFile(path.join(__dirname, RESOURCE_PATHS[1]));

    for (let i = 0; i < this.atlases.length; i++) {
      const atlas = this.atlases[i];
      if (
        !(await atlas.loadFromFile(path.join(__dirname, RESOURCE_PATHS[i + 2])))
      ) {
        process.exit(4);
      }
    }

    for (let i = 0; i < this.atlases.length - this.numberOfPlayers; i++) {
      this.atlases[i].trimByGrid(TILE_SIZE, TILE_SIZE);
    }
    this.atlases[this.atlases.length - 1].trimByGrid(50, 42);

    await this.initGamePlay(RESOURCE_PATHS[0]);
    await this.gui.init(
      this.font,
      30,
      this.windowWidth,
      this.windowHeight,
      this.out
    );
  }

  processEvent() {
    if (this.out.exit) return;
    if (!this.endOfGame) {
      const input = [
        [ 0, 0 ],
        [ 0, 0 ],
      ];
      if (Keyboard.isKeyPressed('Left')) {
        input[1][0] = -1;
      } else if (Keyboard.isKeyPressed('Right')) {
        input[1][0] = 1;
      }

      if (Keyboard.isKeyPressed('Up')) {
        input[1][1] = -1;
      } else if (Keyboard.isKeyPressed('Down')) {
        input[1][1] = 1;
      }

      if (Keyboard.isKeyPressed('A')) {
        input[0][0] = -1;
      } else if (Keyboard.isKeyPressed('D')) {
        input[0][0] = 1;
      }

      if (Keyboard.isKeyPressed('W')) {
        input[0][1] = -1;
      } else if (Keyboard.isKeyPressed('S')) {
        input[0][1] = 1;
      }

      for (let i = 0; i < input.length; i++) {
        this.players[i].onMoveKeyPressed(input[i][0], input[i][1]);
      }
    }

    let event;
    while ((event = this.window.pollEvent())) {
      this.gui.processEvent(Mouse.getPosition(this.window), event);

      if (event.type === 'Closed') {
        this.out.exit = true;
        this.out.enterMenu = false;
        break;
      }

      if (!this.endOfGame) {
        if (event.type === 'KeyPressed' && event.key.codeStr === 'Space') {
          this.players[1].onActionKeyPressed();
        }

        if (event.type === 'KeyPressed' && event.key.codeStr === 'LControl') {
          this.players[0].onActionKeyPressed();
        }

        // TODO: Pause
      }
    }
  }

  async run() {
    this.out.exit = false;
    while (!this.out.exit) {
      this.processEvent();
      const dt = this.clock.getElapsedTime().asSeconds();
      await this.update(dt);
      this.clock.restart();

      this.draw();
      await new Promise(resolve => setImmediate(resolve));
    }

    return this.out.enterMenu;
  }

  async update(dt) {
    this.physicsEngine.update(dt);

    for (let i = 0; i < this.players.length; i++) {
      const player = this.players[i];
      if (!this.endOfGame) {
        player.update(dt);
      }

      if (!player.getIsAlive()) {
        this.endOfGame = true;

        if (!i) {
          this.players[1].setWin(true);
          break;
        } else {
          this.players[0].setWin(true);
        }
      }
    }

    this.bombManager.update(dt);

    if (this.endOfGame && !this.out.exit) {
      this.gui.updateStatsOutter(
        this.players,
        Mouse.getPosition(this.window).x,
        Mouse.getPosition(this.window).y,
        this.out.playAgain,
        this.out.exit,
        this.out.enterMenu
      );
    } else {
      this.gui.updateStats(
        this.players,
        Mouse.getPosition(this.window).x,
        Mouse.getPosition(this.window).y
      );
    }

    if (this.endOfGame && this.out.playAgain) {
      await this.initGamePlay('data/sample_level.txt');
    }
  }

  draw() {
    this.window.clear();
    this.levelView.draw(this.window);

    for (const player of this.players) {
      player.draw(this.window);
    }

    this.gui.draw(this.window);
    this.window.display();
  }
}

module.exports = Game;
