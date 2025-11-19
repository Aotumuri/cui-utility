#!/usr/bin/env node

const { startGradient } = require('./lib');

function runExample(text = 'Gradient Example') {
  const states = {
    rainbow: '',
    darkrainbow: '',
  };

  const renderCombined = () => {
    const parts = [
      label('Rainbow', states.rainbow),
      label('DarkRainbow', states.darkrainbow),
    ];
    process.stdout.write(`\r${parts.join('   ')}`);
  };

  renderCombined();

  const stopRainbow = startGradient('rainbow', text, 60, {
    onFrame(colored) {
      states.rainbow = colored;
      renderCombined();
    },
  });

  const stopDark = startGradient('darkrainbow', text, 80, {
    onFrame(colored) {
      states.darkrainbow = colored;
      renderCombined();
    },
  });

  return () => {
    if (typeof stopRainbow === 'function') {
      stopRainbow();
    }
    if (typeof stopDark === 'function') {
      stopDark();
    }
  };
}

function label(name, coloredText) {
  return `${name}: ${coloredText || ''}`;
}

if (require.main === module) {
  const text = process.argv.slice(2).join(' ') || 'Gradient Example';
  const stop = runExample(text);
  const cleanup = () => {
    if (typeof stop === 'function') {
      stop();
    }
    process.stdout.write('\n');
    process.exit(0);
  };
  process.once('SIGINT', cleanup);
}

module.exports = runExample;
