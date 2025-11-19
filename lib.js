const gradientHandlers = {
  rainbow: require('./gradient/rainbow'),
  darkrainbow: require('./gradient/darkrainbow'),
  sunset: require('./gradient/sunset'),
  loading: require('./gradient/loading'),
};

function startGradient(effect, text, speed = 80, options = {}) {
  const handler = gradientHandlers[effect];
  if (!handler) {
    const error = new Error(`Unknown gradient effect "${effect}".`);
    error.code = 'UNKNOWN_GRADIENT';
    throw error;
  }
  return handler(text, speed, options);
}

module.exports = {
  startGradient,
  gradients: gradientHandlers,
};
