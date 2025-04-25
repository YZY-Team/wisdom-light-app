module.exports = function (api) {
  api.cache(true);
  const plugins = [['inline-import', { extensions: ['.sql'] }]]; // 添加这行

  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    plugins,
  };
};
