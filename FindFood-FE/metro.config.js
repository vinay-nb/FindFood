const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 1. Prioritize CJS (CommonJS) during resolution to catch legacy libs
config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'cjs', 'json', 'mjs'];

// 2. Disable experimental package exports (which usually trigger the require error)
config.resolver.unstable_enablePackageExports = false;

// 3. Ensure the transformer doesn't force 'import' conversion on CommonJS files
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = config;
