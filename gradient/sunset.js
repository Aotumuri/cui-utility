const chalk = require('chalk');

module.exports = function sunset(text, speed, options = {}) {
  const palette = [
    { h: 18, s: 95, l: 55 },
    { h: 30, s: 90, l: 50 },
    { h: 345, s: 80, l: 60 },
    { h: 285, s: 75, l: 55 },
    { h: 260, s: 70, l: 50 },
  ];
  const waveLength = 2;
  const totalSteps = palette.length * waveLength;
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
        const position = (frame + mappedIndex) % totalSteps;
        const paletteIndex = Math.floor(position / waveLength);
        const color = palette[paletteIndex];
        return chalk.hsl(color.h, color.s, color.l)(char);
      })
      .join('');

    onFrame(colored);
    frame = (frame + 1) % totalSteps;
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
