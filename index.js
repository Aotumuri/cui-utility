#!/usr/bin/env node

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

  if (category === 'gradient') {
    const [effect, ...textParts] = rest;
    if (!effect) {
      printHelp();
      process.exit(1);
    }
    const text = textParts.length > 0 ? textParts.join(' ') : 'Hello World!';
    const speed = getSpeed(options.speed);
    let stop;
    try {
      stop = startGradient(effect, text, speed);
    } catch (error) {
      console.error(error.message);
      printHelp();
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

function printHelp() {
  console.log(
    [
      'Usage:',
      '  clitl gradient <rainbow|darkrainbow> [text] [--speed <ms>]',
      '  clitl example [text]',
      '',
      'Examples:',
      '  clitl gradient rainbow "Hello World" --speed 50',
      '  clitl gradient darkrainbow "Night Mode"',
      '  clitl example "Side by side demo"',
    ].join('\n')
  );
}

function parseArgs(args) {
  const positional = [];
  const options = { speed: 80 };

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

module.exports = {
  startGradient,
  runExample,
  gradients,
};
