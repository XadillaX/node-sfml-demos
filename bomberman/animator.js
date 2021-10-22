'use strict';

// https://github.com/PiGames/Bomberman/blob/master/Bomberman/Animator.cpp
class Animator {
  constructor() {
    this.activeStateName = '';
    this.activeStateInfo = null;
    this.animationSpeed = 1;
    this.delay = 0.5;
    this.elapsedTime = 0;
    this.sprite = null;

    this.currentFrame = 0;
    this.lastFrame = 0;

    this.loop = false;
    this.animIsPlaying = false;
    this.states = new Map();

    this.timeToChangeFrame = this.delay / this.animationSpeed;
  }

  addAnimationState(name, atlas, begin, end, autoPlay) {
    let state = this.states.get(name);
    if (!state) {
      state = {
        atlas,
        beg: begin,
        end,
      };
      this.states.set(name, state);

      if (autoPlay) {
        this.changeActiveState(name);
      }

      return true;
    }

    return false;
  }

  animate(dt) {
    if (!this.animIsPlaying) return;

    this.elapsedTime += dt;
    if (this.elapsedTime > this.timeToChangeFrame) {
      this.currentFrame++;
      if (this.currentFrame > this.lastFrame) {
        if (this.loop) {
          this.currentFrame = this.activeStateInfo.beg;
        } else {
          this.currentFrame = this.activeStateInfo.end;
          this.animIsPlaying = false;
        }
      }

      this.activeStateInfo.atlas.setSpriteTextureByIndex(
        this.sprite,
        this.currentFrame
      );
      this.elapsedTime = 0;
    }
  }

  changeActiveState(name) {
    if (!this.sprite) return false;

    const state = this.states.get(name);
    if (!state) return false;

    this.activeStateName = name;
    this.activeStateInfo = state;

    this.currentFrame = state.beg;
    this.lastFrame = state.end;

    this.activeStateInfo.atlas.setSpriteTextureByIndex(
      this.sprite,
      this.activeStateInfo.beg
    );
    this.animIsPlaying = true;

    return true;
  }

  getActiveState() {
    return this.activeStateName;
  }

  isPlaying() {
    return this.animIsPlaying;
  }

  pause() {
    this.animIsPlaying = false;
  }

  play() {
    this.animIsPlaying = true;
  }

  setAnimationSpeed(speed) {
    this.animationSpeed = speed;
    if (this.animationSpeed < 0.0001) {
      this.animationSpeed = 0.0001;
    }

    this.timeToChangeFrame = this.delay / this.animationSpeed;
  }

  setDelayBetweenFrames(delay) {
    this.delay = delay;
    if (this.delay < 0.0) this.delay = 0.0;
    this.timeToChangeFrame = this.delay / this.animationSpeed;
  }

  setLoop(loop) {
    this.loop = loop;
  }

  setSprite(sprite) {
    this.sprite = sprite;
  }

  stop() {
    this.changeActiveState(this.activeStateName);
    this.pause();
  }
}

module.exports = Animator;
