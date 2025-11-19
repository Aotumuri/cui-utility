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

test('sunset gradient emits frames', async () => {
  await new Promise((resolve, reject) => {
    let frames = 0;
    const stop = startGradient('sunset', 'Sunset', 5, {
      onFrame() {
        frames += 1;
        if (frames >= 2) {
          stop();
          resolve();
        }
      },
    });

    setTimeout(() => {
      stop();
      reject(new Error('Sunset gradient timeout'));
    }, 200);
  });
});

test('multiple gradients and example run concurrently without interference', async () => {
  await new Promise((resolve, reject) => {
    const states = {
      rainbow: 0,
      dark: 0,
      sunset: 0,
      example: 0,
    };

    const stopRainbow = startGradient('rainbow', 'A', 5, {
      onFrame() {
        states.rainbow += 1;
        checkDone();
      },
    });

    const stopDark = startGradient('darkrainbow', 'B', 5, {
      onFrame() {
        states.dark += 1;
        checkDone();
      },
    });

    const stopSunset = startGradient('sunset', 'C', 5, {
      onFrame() {
        states.sunset += 1;
        checkDone();
      },
    });

    const stopExample = runExample('Concurrent');

    function checkDone() {
      if (
        states.rainbow >= 2 &&
        states.dark >= 2 &&
        states.sunset >= 2 &&
        states.example === 0
      ) {
        states.example = 1;
        stopRainbow();
        stopDark();
        stopSunset();
        stopExample();
        resolve();
      }
    }

    setTimeout(() => {
      stopRainbow();
      stopDark();
      stopSunset();
      stopExample();
      reject(new Error('Concurrent gradient test timed out'));
    }, 200);
  });
});
