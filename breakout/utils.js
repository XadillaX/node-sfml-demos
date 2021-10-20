'use strict';

const { Keyboard } = require('sfml.js');

function usefulKeyStates() {
  let leftPressed = false;
  let rightPressed = false;
  let spacePressed = false;

  if (Keyboard.isKeyPressed('A') || Keyboard.isKeyPressed('Left')) {
    leftPressed = true;
  }

  if (Keyboard.isKeyPressed('D') || Keyboard.isKeyPressed('Right')) {
    rightPressed = true;
  }

  if (Keyboard.isKeyPressed('Space')) {
    spacePressed = true;
  }

  if (!(leftPressed ^ rightPressed)) {  // eslint-disable-line
    leftPressed = rightPressed = false;
  }

  return {
    leftPressed,
    rightPressed,
    spacePressed,
  };
}

exports.usefulKeyStates = usefulKeyStates;
