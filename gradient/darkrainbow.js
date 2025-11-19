const chalk = require('chalk');

module.exports = function darkRainbow(text, speed, options = {}) {
  const frameStep = 12;
  const saturation = 90;
  const lightness = 35;
  let frame = 0;
  const onFrame = options.onFrame || defaultWriter;
  const reverse = options.direction === 'right';

  const render = () => {
    const chars = text.split('');
    const colored = chars
      .map((char, index) => {
        if (char === ' ') {
          return ' ';
        }
        const mappedIndex = reverse ? chars.length - 1 - index : index;
        const offset = frame + mappedIndex * frameStep;
        const hue = ((offset % 360) + 360) % 360;
        return chalk.hsl(hue, saturation, lightness)(char);
      })
      .join('');

    onFrame(colored);
    frame = (frame + frameStep) % 360;
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
