#!/usr/bin/env node

// Enable update notifications
import updateNotifier from 'update-notifier';
import pkg from './package.json' assert { type: 'json' };
updateNotifier({ pkg }).notify();

const { startGradient, gradients } = require('./lib');
const runExample = require('./example');

if (require.main === module) {
  main(process.argv.slice(2));
}

function main(argv) {
  const { positional, options } = parseArgs(argv);
  const [category, ...rest] = positional;

  if (!category) {
    printHelp();
    process.exit(1);
  }

  if (category === 'help') {
    const topic = rest[0];
    printHelp(topic);
    return;
  }

  if (category === 'gradient') {
    const [effect, ...textParts] = rest;
    if (!effect) {
      printHelp('gradient');
      process.exit(1);
    }
    const text = textParts.length > 0 ? textParts.join(' ') : 'Hello World!';
    const speed = getSpeed(options.speed);
    const direction = getDirection(options.direction);
    let stop;
    try {
      stop = startGradient(effect, text, speed, { direction });
    } catch (error) {
      console.error(error.message);
      printHelp('gradient');
      process.exit(1);
      return;
    }
    process.once('SIGINT', createCleanup(stop));
  } else if (category === 'example') {
    const text = rest.length > 0 ? rest.join(' ') : 'Gradient Example';
    const stop = runExample(text);
    process.once('SIGINT', createCleanup(stop));
  } else {
    console.error(`Unknown command "${category}".`);
    printHelp();
    process.exit(1);
  }
}

function createCleanup(stop) {
  return () => {
    if (typeof stop === 'function') {
      stop();
    }
    process.stdout.write('\n');
    process.exit(0);
  };
}

function printHelp(topic) {
  const base = [];

  if (!topic) {
    base.push(
      '',
      'Commands:',
      '  clitl gradient <effect> [text] [--speed <ms>] [--direction <left|right>]',
      '  clitl <command> [options]',
      '  clitl help [command]',
    );
  } else if (topic === 'gradient') {
    base.push(
      '',
      'Gradient command:',
      '  clitl gradient <effect> [text] [--speed <ms>]',
      `  Available effects: ${Object.keys(gradients).join(', ')}`,
      '',
      'Options:',
      '  --speed, -s        Delay between frames in milliseconds (default: 80)',
      '  --direction, -d    Gradient flow direction: left (default) or right'
    );
  } else if (topic === 'example') {
    base.push(
      '',
      'Example command:',
      '  clitl example [text]',
      '  Renders rainbow, darkrainbow, sunset, loading, and glitch animations together.'
    );
  } else if (topic === 'help') {
    base.push(
      '',
      'Help command:',
      '  clitl help [command]',
      '  Shows general or command-specific instructions.'
    );
  } else {
    base.push(
      '',
      `Unknown help topic "${topic}".`,
      'Available topics: gradient, example, help.'
    );
  }

  console.log(base.join('\n'));
}

function parseArgs(args) {
  const positional = [];
  const options = { speed: 80, direction: 'left' };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--speed' || arg === '-s') {
      const next = args[i + 1];
      if (next === undefined) {
        console.error('Missing value after --speed.');
        process.exit(1);
      }
      options.speed = next;
      i += 1;
    } else if (arg.startsWith('--speed=')) {
      options.speed = arg.split('=')[1];
    } else if (arg === '--direction' || arg === '-d') {
      const next = args[i + 1];
      if (next === undefined) {
        console.error('Missing value after --direction.');
        process.exit(1);
      }
      options.direction = next;
      i += 1;
    } else if (arg.startsWith('--direction=')) {
      options.direction = arg.split('=')[1];
    } else {
      positional.push(arg);
    }
  }

  return { positional, options };
}

function getSpeed(raw) {
  const parsed = Number(raw);
  if (Number.isNaN(parsed) || parsed <= 0) {
    console.error(`Invalid speed "${raw}". Expected a positive number (ms between frames).`);
    process.exit(1);
  }
  return parsed;
}

function getDirection(raw) {
  const normalized = (raw || 'left').toLowerCase();
  if (normalized !== 'left' && normalized !== 'right') {
    console.error(`Invalid direction "${raw}". Expected "left" or "right".`);
    process.exit(1);
  }
  return normalized;
}

module.exports = {
  startGradient,
  runExample,
  gradients,
};
