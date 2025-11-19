const chalk = require('chalk');

const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/\\~ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

module.exports = function glitch(text, speed, options = {}) {
  const onFrame = options.onFrame || defaultWriter;
  let frame = 0;

  const render = () => {
    const jittered = jitterText(text, frame);
    const colored = jittered
      .split('')
      .map((char) => colorize(char, frame))
      .join('');
    onFrame(colored);
    frame += 1;
  };

  render();
  const ticker = setInterval(render, speed);

  return () => {
    clearInterval(ticker);
    if (typeof options.onStop === 'function') {
      options.onStop();
    }
  };
};

function jitterText(str, frame) {
  return str
    .split('')
    .map((char) => {
      if (char === ' ' || char === '\n' || char === '\r') {
        return char;
      }
      if (Math.random() < 0.05) { // chance to glitch
        return randomChar();
      }
      if ((frame + Math.random()) % 17 < 1) { // chance to become space
        return ' ';
      }
      return char;
    })
    .join('');
}

function colorize(char, frame) {
  if (char === ' ' || char === '\n' || char === '\r') {
    return char;
  }
  const isGrayPhase = frame % 13 === 0 || Math.random() < 0.1;
  if (isGrayPhase) {
    const value = 100 + Math.floor(Math.random() * 155);
    return chalk.rgb(value, value, value)(char);
  }
  return chalk.white(char);
}

function randomChar() {
  return glitchChars[Math.floor(Math.random() * glitchChars.length)];
}

function defaultWriter(text) {
  process.stdout.write(`\r${text}`);
}
