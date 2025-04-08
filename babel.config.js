module.exports = function (api) {
  api.cache(true);
  const plugins = ['react-native-reanimated/plugin'];  // 添加这行

  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    plugins,
  };
};
