var webpack = require('webpack'),
	autoprefixer = require('autoprefixer'),
	prodEnv = process.env.NODE_ENV == 'production' // eslint-disable-line no-undef

module.exports = {
	devtool: 'cheap-module-source-map',
	entry: prodEnv ? [
		'babel-polyfill',
		'./source/entry.js'
	] : [
		'webpack-dev-server/client?http://localhost:3000/',
		'webpack/hot/only-dev-server',
		'react-hot-loader/patch',
		'babel-polyfill',
		'./source/entry.js'
	],
	output: {
		path: require('path').resolve('./dist/'),
		filename: 'bundle.js',
		publicPath: '/dist/'
	},
	module: {
		loaders: [ {
			test: /\.css$/,
			use: [
				{
					loader: 'style-loader',
				},
				{
					loader: 'css-loader',
					options: {
						sourceMap: true,
						importLoaders: 1,
					}
				},
				{
					loader: 'postcss-loader',
					options: {
						sourceMap: 'inline',
					}
				}
			]
		}, {
			test: /\.html$/,
			loader: 'html-loader'
		},
		{
			test: /\.yaml$/,
			loader: 'json-loader!yaml-loader'
		},
		{
			test: /\.js$/,
			exclude: /node_modules/,
			loader: 'babel-loader'
		},
		{
			test: /\.(jpe?g|png|gif|svg)$/i,
			loader: 'url-loader?limit=10000&name=images/[name].[ext]!img-loader?progressive=true'
		}, {
			test: /\.ne$/,
			loader: 'babel-loader!nearley-loader'
		}]
	},
	plugins: [
		new webpack.EnvironmentPlugin(['NODE_ENV']),
		new webpack.NoEmitOnErrorsPlugin(),
		new webpack.ProvidePlugin({
			'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch',
		}),
	]
	.concat(!prodEnv ? [new webpack.HotModuleReplacementPlugin()] : [])
	.concat(prodEnv ? [new webpack.optimize.UglifyJsPlugin()] : []),
}
