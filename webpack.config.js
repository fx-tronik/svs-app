module.exports = {
      module: {
        rules: [
          {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: {
              loader: "babel-loader"
            }
          },
        {
            test: /\.svg$/,
            use: [{
                loader: "babel-loader"
              },
              {
                loader: "react-svg-loader",
                options: {
                  jsx: true,
                  svgo: {
                    plugins: [{ cleanupIDs: false }]
                  }
                }
              }]
        },
	{ test: /\.css$/, loaders: ['style-loader', 'css-loader'] },
	{
          test: /\.(png|jpg|gif)$/,
          use: {
            loader: 'url-loader'
          }
        },
	{
                test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'static/ui/fonts/'
                    }
                }]
        }
        ]
      },
      resolve: {
          extensions: ['.js', '.jsx'],
      }
};
