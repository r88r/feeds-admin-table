var webpack = require("webpack"),
	path = require('path')
	;

module.exports = {
  /*
  entry: "./app/App.js",
  output: {
    filename: "public/bundle.js"
  },
  */
  entry: {
  	Feeds: "./app/Feeds.js"
  },
  output: {
    path: path.join(__dirname, "public/js"),
    filename: "[name].bundle.js",
    chunkFilename: "[id].chunk.js"
  },
  module: {
    loaders: [
      {test: /\.js$/, loader: 'jsx-loader'}
    ]
  },
  externals: {
  	moment: "moment",
  	ioClient: "io"
  },
	plugins: [
		new webpack.optimize.CommonsChunkPlugin("shared.js")
    ]
/*
	plugins: [
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false
			}
		})
    ]
//*/
};