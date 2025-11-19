process.env.FORCE_COLOR = '1';

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

test('loading gradient emits frames', async () => {
  await new Promise((resolve, reject) => {
    let count = 0;
    const stop = startGradient('loading', 'Loading', 5, {
      onFrame() {
        count += 1;
        if (count >= 2) {
          stop();
          resolve();
        }
      },
    });

    setTimeout(() => {
      stop();
      reject(new Error('Loading gradient timeout'));
    }, 200);
  });
});

test('glitch gradient emits frames', async () => {
  await new Promise((resolve, reject) => {
    let count = 0;
    const stop = startGradient('glitch', 'GLITCH', 5, {
      onFrame() {
        count += 1;
        if (count >= 2) {
          stop();
          resolve();
        }
      },
    });

    setTimeout(() => {
      stop();
      reject(new Error('Glitch gradient timeout'));
    }, 200);
  });
});

test('direction option reverses gradient ordering', async () => {
  const leftFrame = await captureFrame('left');
  const rightFrame = await captureFrame('right');

  const firstLeft = firstColorCode(leftFrame);
  const lastLeft = lastColorCode(leftFrame);
  const firstRight = firstColorCode(rightFrame);
  const lastRight = lastColorCode(rightFrame);

  assert.ok(firstLeft && lastLeft && firstRight && lastRight, 'color codes should exist');
  assert.strictEqual(firstLeft, lastRight);
  assert.strictEqual(lastLeft, firstRight);
});

test('multiple gradients and example run concurrently without interference', async () => {
  await new Promise((resolve, reject) => {
    const states = {
      rainbow: 0,
      dark: 0,
      sunset: 0,
      loading: 0,
      glitch: 0,
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

    const stopLoading = startGradient('loading', 'D', 5, {
      onFrame() {
        states.loading += 1;
        checkDone();
      },
    });

    const stopGlitch = startGradient('glitch', 'E', 5, {
      onFrame() {
        states.glitch += 1;
        checkDone();
      },
    });

    const stopExample = runExample('Concurrent');

    function checkDone() {
      if (
        states.rainbow >= 2 &&
        states.dark >= 2 &&
        states.sunset >= 2 &&
        states.loading >= 2 &&
        states.glitch >= 2 &&
        states.example === 0
      ) {
        states.example = 1;
        stopRainbow();
        stopDark();
        stopSunset();
        stopLoading();
        stopGlitch();
        stopExample();
        resolve();
      }
    }

    setTimeout(() => {
      stopRainbow();
      stopDark();
      stopSunset();
      stopLoading();
      stopGlitch();
      stopExample();
      reject(new Error('Concurrent gradient test timed out'));
    }, 200);
  });
});

async function captureFrame(direction) {
  return new Promise((resolve) => {
    let stopFn;
    let shouldStopAfterInit = false;
    let resolved = false;
    const options = {
      direction,
      onFrame(colored) {
        if (resolved) {
          return;
        }
        resolved = true;
        resolve(colored);
        if (stopFn) {
          stopFn();
        } else {
          shouldStopAfterInit = true;
        }
      },
    };
    stopFn = startGradient('rainbow', 'ABCD', 50, options);
    if (shouldStopAfterInit && stopFn) {
      stopFn();
    }
  });
}

const COLOR_REGEX = /\u001B\[38;2;[0-9]+;[0-9]+;[0-9]+m/g;

function firstColorCode(str) {
  const matches = str.match(COLOR_REGEX);
  return matches ? matches[0] : null;
}

function lastColorCode(str) {
  const matches = str.match(COLOR_REGEX);
  if (!matches || matches.length === 0) {
    return null;
  }
  return matches[matches.length - 1];
}
