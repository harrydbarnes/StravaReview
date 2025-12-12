function replaceImportMetaWithProcess() {
  return {
    visitor: {
      MetaProperty(path) {
        path.replaceWithSourceString('process');
      },
    },
  };
}

module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-react',
  ],
  plugins: [replaceImportMetaWithProcess],
};
