'use strict';

const path = require('path');

const { Clock, Font } = require('sfml.js');

const Animator = require('./animator');
const GUI = require('./gui');
const Level = require('./level');
const LevelView = require('./level_view');
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
    this.playAgain = false;
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

  async run() {
    this.out.exit = false;
    while (!this.out.exit) {
      let event;
      while ((event = this.window.pollEvent())) {
        if (event.type === 'Closed') {
          return false;
        }
      }

      const dt = this.clock.getElapsedTime().asSeconds();
      await this.update(dt);
      this.clock.restart();

      this.draw();
      await new Promise(resolve => setImmediate(resolve));
    }

    return this.out.enterMenu;
  }

  update(dt) {
    for (const player of this.players) {
      if (!this.endOfGame) {
        player.update(dt);
      }
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
