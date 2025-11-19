#!/usr/bin/env node

const readline = require('node:readline');
const { startGradient } = require('./lib');

const DIVIDER = '   ';
const ANSI_REGEX = /\u001B\[[0-?]*[ -/]*[@-~]/g;

function runExample(text = 'Gradient Example') {
  const states = {
    rainbow: '',
    darkrainbow: '',
    sunset: '',
    loading: '',
  };
  const supportsDynamicLayout = Boolean(process.stdout.isTTY);
  let previousLines = 0;

  const renderCombined = () => {
    const parts = [
      label('Rainbow', states.rainbow),
      label('DarkRainbow', states.darkrainbow),
      label('Sunset', states.sunset),
      label('Loading', states.loading),
    ];

    if (!supportsDynamicLayout) {
      process.stdout.write(`\r${parts.join(DIVIDER)}`);
      return;
    }

    const width = getTerminalWidth();
    const lines = layoutParts(parts, width);
    rewriteOutput(lines);
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

  const stopSunset = startGradient('sunset', text, 70, {
    onFrame(colored) {
      states.sunset = colored;
      renderCombined();
    },
  });

  const stopLoading = startGradient('loading', text, 65, {
    onFrame(colored) {
      states.loading = colored;
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
    if (typeof stopSunset === 'function') {
      stopSunset();
    }
    if (typeof stopLoading === 'function') {
      stopLoading();
    }
  };

  function rewriteOutput(lines) {
    if (previousLines > 0) {
      readline.cursorTo(process.stdout, 0);
      if (previousLines > 1) {
        readline.moveCursor(process.stdout, 0, -(previousLines - 1));
      }
      readline.clearScreenDown(process.stdout);
    }
    process.stdout.write(lines.join('\n'));
    previousLines = lines.length;
  }
}

function layoutParts(parts, maxWidth) {
  if (!Number.isFinite(maxWidth) || maxWidth <= 0) {
    return [parts.join(DIVIDER)];
  }

  const lines = [];
  let currentParts = [];
  let currentWidth = 0;

  parts.forEach((part) => {
    const partWidth = visibleLength(part);
    const spaceWidth = currentParts.length > 0 ? DIVIDER.length : 0;

    if (currentParts.length > 0 && currentWidth + spaceWidth + partWidth > maxWidth) {
      lines.push(currentParts.join(DIVIDER));
      currentParts = [part];
      currentWidth = partWidth;
    } else {
      if (spaceWidth) {
        currentWidth += spaceWidth;
      }
      currentParts.push(part);
      currentWidth += partWidth;
    }
  });

  if (currentParts.length > 0) {
    lines.push(currentParts.join(DIVIDER));
  }

  return lines;
}

function getTerminalWidth() {
  return typeof process.stdout.columns === 'number' ? process.stdout.columns : Infinity;
}

function visibleLength(str) {
  return str.replace(ANSI_REGEX, '').length;
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
