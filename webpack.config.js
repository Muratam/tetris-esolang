module.exports = {
  mode: 'development',
  entry: { 'main': './src/main.ts' },
  output: { path: `${__dirname}/dist`, filename: '[name].js' },
  module: {
    rules: [
      { test: /\.ts$/, use: 'ts-loader' },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] }
    ]
  },
  resolve: { extensions: ['.ts', '.js'], },
  node: { fs: 'empty' }
};
