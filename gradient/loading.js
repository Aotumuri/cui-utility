const chalk = require('chalk');

module.exports = function loading(text, speed, options = {}) {
  const baseColor = chalk.rgb(50, 50, 50);
  const highlightLevels = [255, 220, 190, 220];
  const highlightFns = highlightLevels.map((level) => chalk.rgb(level, level, level));
  const highlightLength = highlightFns.length;
  const onFrame = options.onFrame || defaultWriter;
  let frame = 0;

  const render = () => {
    const chars = text.split('');
    const cycleLength = chars.length + highlightLength;
    const colored = chars
      .map((char, index) => {
        if (char === ' ') {
          return ' ';
        }
        const offset = (frame + index) % cycleLength;
        if (offset < highlightLength) {
          return highlightFns[offset](char);
        }
        return baseColor(char);
      })
      .join('');

    onFrame(colored);
    frame = (frame + 1) % cycleLength;
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

function defaultWriter(colored) {
  process.stdout.write(`\r${colored}`);
}
