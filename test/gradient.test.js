const test = require('node:test');
const assert = require('node:assert/strict');

const { startGradient, runExample } = require('..');

test('startGradient emits frames and stops cleanly', async () => {
  await new Promise((resolve, reject) => {
    let frames = 0;
    let stopped = false;
    let stop;
    try {
      stop = startGradient('rainbow', 'Test', 5, {
        onFrame() {
          frames += 1;
          if (frames >= 3 && !stopped) {
            stopped = true;
            stop();
            try {
              assert.ok(frames >= 3);
              resolve();
            } catch (error) {
              reject(error);
            }
          }
        },
      });
    } catch (error) {
      reject(error);
      return;
    }

    setTimeout(() => {
      if (!stopped) {
        stopped = true;
        stop();
        reject(new Error('startGradient did not emit enough frames in time'));
      }
    }, 200);
  });
});

test('startGradient throws for unknown gradient', () => {
  assert.throws(() => startGradient('unknown-effect', 'Test'), {
    code: 'UNKNOWN_GRADIENT',
  });
});

test('runExample returns stop function', async () => {
  await new Promise((resolve) => {
    const stop = runExample('Example');
    setTimeout(() => {
      stop();
      resolve();
    }, 100);
  });
});
