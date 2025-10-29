// babel.config.js
module.exports = function (api) {
  // Detecta la plataforma del caller (web / ios / android)
  const platform = api.caller?.((caller) => caller?.platform);

  // Evita conflictos de caché: NO uses api.cache(true)
  // Si quieres, puedes usar cache en función de la plataforma:
  // api.cache.using(() => platform);

  return {
    presets: ['babel-preset-expo'],
    plugins: platform === 'web' ? ['babel-plugin-transform-import-meta'] : [],
  };
};
