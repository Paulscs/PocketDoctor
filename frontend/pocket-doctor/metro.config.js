// metro.config.js  (si tienes "type":"module", nómbralo metro.config.cjs)
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// (debug) imprime para confirmar que Metro está leyendo este archivo
console.log('[metro] config loaded from', __filename);

// Preferir entradas CJS
config.resolver.unstable_conditionNames = [
  'react-native',
  'browser',
  'require',
  'default',
];

// Reconocer .cjs
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];

// 🔑 RUTA DEL REGISTRY PARA ASSETS (web/metro)
try {
  const expoAssetRegistryPath = require.resolve('@expo/metro-runtime/assetRegistryPath');
  config.transformer.assetRegistryPath = expoAssetRegistryPath;
  console.log('[metro] assetRegistryPath =', expoAssetRegistryPath);
} catch (e) {
  // Fallback universal (RN nativo); en la práctica también sirve para web
  const rnAssetRegistryPath = require.resolve('react-native/Libraries/Image/AssetRegistry');
  config.transformer.assetRegistryPath = rnAssetRegistryPath;
  console.log('[metro] assetRegistryPath (fallback) =', rnAssetRegistryPath);
}

module.exports = config;
