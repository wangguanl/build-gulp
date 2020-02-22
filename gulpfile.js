/*
    create by Mr.Wang 2020/02/22
    * 功能说明
        1、此文件只用于打包， 开发环境请自行配置。
        2、压缩CSS并且生成新的版本号
        3、压缩JS并且对es6+的语法转换为es5
        4、压缩HTML、img文件
        5、更多详情请看代码配置
    
    运行文件请先下载依赖模块：
    
    * 存在package.json文件
        $ npm install
    
    * 安装成功后出现node_modules，若想删除node_modules这个文件夹，可直接删除， 或下载rimraf模块
        1、$ npm|cnpm install -g rimraf  // 下载rimraf模块
        2、$ rimraf node_modules // 删除node_modules

    
    * 依赖模块安装成功后
        $ gulp 运行命令进行打包。

 */
/*
    文件路径配置
 */
const config = {
	enter: { // 文件路径
		html: ['src/**/*.html'],

		scss: ['src/**/*.scss'],
		css: ['src/**/*.css'],
		cssMin: ['src/**/*.css', '!src/**/*.min.css'], // 此列表文件不执行压缩

		js: ['src/**/*.js'],
		jsMin: ['src/**/*.js', '!src/**/*.min.js'], // 此列表文件不执行压缩

		img: ['src/**/*.{png,jpg,gif,jpeg}'],
		font: ['src/**/*.{json,eot,svg,ico,ttf,woff,woff2}']
	},
	output: __dirname + '/dist', // 打包路径,
	log: __dirname + '/log' // 打包的日志文件
}



// 引入依赖模块
const gulp = require('gulp'),
	// 压缩html
	htmlMin = require("gulp-htmlmin"),

	// 压缩css
	sass = require('gulp-dart-sass'),
	postcss = require('gulp-postcss'),
	autoprefixer = require('autoprefixer'),
	cleanCSS = require('gulp-clean-css'),

	// 压缩js
	uglify = require('gulp-uglify'),
	babel = require("gulp-babel"), // es6+转es5 需要配置规则（可生成.babelrc文件进行配置，也可在函数内配置。配置后请使用npm下载对应的插件）
	stripDebug = require('gulp-strip-debug'), // 清除 console.log

	// 压缩图片
	// tinypng = require('gulp-tinypng-compress'),
	// imagemin = require('gulp-imagemin'),
	// imageminJpegRecompress = require('imagemin-jpeg-recompress'), // jpg图片压缩
	// imageminOptipng = require('imagemin-optipng'), //png图片压缩

	// 对文件名加MD5后缀
	rev = require('gulp-rev'),
	revCollector = require('gulp-rev-collector'), //路径替换
	filter = require('gulp-filter'); // 筛选文件



gulp.task('default', done => {

	removeDir(config.output); // 先删除打包路径，再打包
	removeDir(config.log); // 先删除日志路径
	removeDir('revCss'); // 先删除日志路径
	removeDir('revJs'); // 先删除日志路径

	pipeScss().then(_ => revCss().then(_ => pipeJs().then(_ => revJs().then(_ => pipeHtml().then(
		_ => pipeImg().then(_ => pipeFile().then(_ => {
			removeDir(config.log); // 删除日志路径
			removeDir('revCss'); // 删除暂时生成css版本目录文件
			removeDir('revJs'); // 删除暂时生成js版本目录文件
			done()
		})))))))
})


// 压缩转义Scss
function pipeScss() {
	return new Promise(resolve => {

		// 过滤不需要过滤的文件
		const filterFile = filter(config.enter.cssMin, {
			restore: true
		});
		gulp.src(config.enter.scss)
			.pipe(sass().on('error', sass.logError)) // sass编译
			.pipe(postcss([autoprefixer()])) // 添加前缀
			.pipe(gulp.dest('src'))
			.pipe(filterFile)
			.pipe(cleanCSS()) // 压缩
			.pipe(rev()) //文件名加MD5后缀
			.pipe(filterFile.restore) // 返回到未过滤执行的所有文件
			.pipe(gulp.dest(config.output))
			.pipe(rev.manifest('rev-css-manifest-log.json')) //生成一个rev-manifest.json
			.pipe(gulp.dest(config.log)) //将 rev-manifest.json 保存到 log 目录内
			.on('end', () => resolve());
	})

}

// 替换新版本css路径
function revCss() {
	return new Promise(resolve => {

		gulp.src(['log/rev-css-manifest-log.json', 'src/**/*.html'])
			.pipe(revCollector({ //替换html中对应的记录 
				replaceReved: true
			}))
			.pipe(gulp.dest('revCss')) //输出到该文件夹中  
			.on('end', () => resolve());
	})
}
// 压缩js 生成新版本
function pipeJs() {
	return new Promise(resolve => {

		const filterFile = filter(config.enter.jsMin, {
			restore: true
		});
		gulp.src(config.enter.js)

			.pipe(filterFile) // 过滤不需要过滤的文件

			.pipe(stripDebug()) // 清除console.log()

			// es6+转es5
			.pipe(babel({
				presets: ['@babel/env'],
				// presets: ['es2015'],
				plugins: [],
				// plugins: ["transform-remove-strict-mode"] // es6+ 转 es5 禁止使用 use strict(严格模式)
			}))

			// 压缩
			.pipe(uglify({
				mangle: true, //类型：Boolean 默认：true 是否修改变量名
				compress: true, //类型：Boolean 默认：true 是否完全压缩
				//preserveComments: 'all' //保留所有注释
			}))
			.pipe(rev()) //文件名加MD5后缀
			.pipe(filterFile.restore) // 返回到未过滤执行的所有文件
			.pipe(gulp.dest(config.output))
			.pipe(rev.manifest('rev-js-manifest-log.json')) //生成一个rev-manifest.json
			.pipe(gulp.dest(config.log)) //将 rev-manifest.json 保存到 rev 目录内
			.on('end', () => resolve());
	})
}

// 替换引用的新版本js路径
function revJs() {
	return new Promise(resolve => {
		gulp.src(['log/rev-js-manifest-log.json', 'revCss/**/*.html'])
			.pipe(revCollector({ //替换html中对应的记录 
				replaceReved: true,
			}))
			.pipe(gulp.dest('revJs')) //输出到该文件夹中  
			.on('end', () => resolve());
	})
}

// 压缩html
function pipeHtml() {
	return new Promise(resolve => {
		const options = {
			removeComments: true, //清除HTML注释
			collapseWhitespace: true, //压缩HTML
			collapseBooleanAttributes: true, //省略布尔属性的值 <input checked="true"/> ==> <input />
			removeEmptyAttributes: true, //删除所有空格作属性值 <input id="" /> ==> <input />
			removeScriptTypeAttributes: true, //删除<script>的type="text/javascript"
			removeStyleLinkTypeAttributes: true, //删除<style>和<link>的type="text/css"
			minifyJS: true, //压缩页面JS
			minifyCSS: true //压缩页面CSS
		};
		gulp.src('revJs/**/*.html')
			.pipe(htmlMin(options))
			.pipe(gulp.dest(config.output))
			.on('end', () => resolve());
	})

}

// 图片压缩任务, 主要支持JPEG及PNG文件
function pipeImg() {
	return new Promise(resolve => {
		gulp.src(config.enter.img)
			.pipe(gulp.dest(config.output))
			.on('end', () => resolve())
		/* .pipe(tinypng({
			key: '6Mf5s28SQC8yHydFMtSFcdpDFswd0ssd',
			// sigFile: 'gulptest/yes/img/.tinypng-sigs',
			// log: true
		}))
		.pipe(gulp.dest(config.output))
		.on('end', () => resolve()) */
		/* const jpgmin = imageminJpegRecompress({
				accurate: true, //高精度模式
				quality: "high", //图像质量:low, medium, high and veryhigh;
				method: "smallfry", //网格优化:mpe, ssim, ms-ssim and smallfry;
				min: 70, //最低质量
				loops: 0, //循环尝试次数, 默认为6;
				progressive: false, //基线优化
				subsample: "default" //子采样:default, disable;
			}),
			pngmin = imageminOptipng({
				optimizationLevel: 3 //优化级别
			});
		gulp.src(config.enter.img)
			.pipe(imagemin({
				use: [jpgmin, pngmin]
			}))
			.pipe(gulp.dest(config.output))
			.on('end', () => resolve()); */
	})
}

// 文件传输, 字体、JSON
function pipeFile() {

	return new Promise(resolve => {
		gulp.src(config.enter.font)
			.pipe(gulp.dest(config.output))
			.on('end', () => resolve())
	})
}



const fs = require('fs'); // node内置模块 fileSystem
function removeDir(path) {
	var files = [];
	if (fs.existsSync(path)) {
		files = fs.readdirSync(path);
		files.forEach(function(file, index) {
			var curPath = path + "/" + file;
			if (fs.statSync(curPath).isDirectory()) { // recurse  
				removeDir(curPath);
			} else { // delete file  
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(path);
	}
}
