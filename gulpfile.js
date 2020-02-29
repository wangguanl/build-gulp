/*
    create by Mr.Wang 2020/02/22
    * 功能说明
        1、功能：1打包、2启动服务。
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
        $ gulp build 运行命令进行打包。
        $ gulp server 运行命令进行启动服务。

 */
/*
    文件路径配置
 */
const config = {
	enter: { // 文件路径
		html: ['src/**/*.html', '!src/assets/**', '!src/static/**'],
		scss: ['src/**/*.scss', '!src/assets/**', '!src/static/**'],
		js: ['src/**/*.js', '!src/assets/**', '!src/static/**'],
	},
	// 合并文件路径
	concat: {
		resetCss: ['src/assets/css/reset.css'],
		commonScss: ['src/assets/css/common.scss', 'src/assets/css/page.scss'],
		utilsJS: ['src/assets/utils/**'],
		commonJS: ['src/assets/js/**'],
		buildoutput: __dirname + '/build/assets',
		serveroutput: __dirname + '/server/assets'
	},
	buildoutput: __dirname + '/build', // 打包路径,
	serveroutput: __dirname + '/server',
	log: __dirname + '/log' // 打包的日志文件
}



// 引入依赖模块
const gulp = require('gulp'),
	browserSync = require('browser-sync'),
	reload = browserSync.reload,
	concat = require('gulp-concat'),
	// 压缩html
	htmlMin = require("gulp-htmlmin"),
	fileinclude = require('gulp-file-include'),

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

	// 对文件名加MD5后缀
	rev = require('gulp-rev'),
	revCollector = require('gulp-rev-collector'), //路径替换
	filter = require('gulp-filter'); // 筛选文件



// 传输所有未处理的文件
gulp.task('removeDir', done => {
	removeDir(config.buildoutput); // 先删除打包路径，再打包
	removeDir(config.log); // 先删除日志路径
	done();
})
gulp.task('buildpipeLibs', function() {
	return gulp.src(['src/static/**', '!src/static/include/**'])
		.pipe(gulp.dest(config.buildoutput + '/static'))
		
})

gulp.task('buildpipeImages', function() {
	return gulp.src(['src/static/images/**'])
		.pipe(tinypng({
			key: '6Mf5s28SQC8yHydFMtSFcdpDFswd0ssd',
		}))
		.pipe(gulp.dest(config.buildoutput + '/static/images'))
		
})


// 合并CSS
gulp.task('buildconcatResetCss', function() {
	return gulp.src(config.concat.resetCss)
		.pipe(concat('reset.css'))
		.pipe(cleanCSS())
		.pipe(rev()) //文件名加MD5后缀
		.pipe(gulp.dest(config.concat.buildoutput))
		.pipe(rev.manifest('rev-concat-css-manifest-log.json')) //生成一个rev-manifest.json
		.pipe(gulp.dest(config.log)) //将 rev-manifest.json 保存到 log 目录内
})

// 合并SCSS
gulp.task('buildconcatCommonScss', function() {
	return gulp.src(config.concat.commonScss)
		.pipe(concat('common.scss'))
		.pipe(sass().on('error', sass.logError)) // sass编译
		.pipe(postcss([autoprefixer()])) // 添加前缀
		.pipe(cleanCSS())
		.pipe(rev()) //文件名加MD5后缀
		.pipe(gulp.dest(config.concat.buildoutput))
		.pipe(rev.manifest('rev-concat-scss-manifest-log.json')) //生成一个rev-manifest.json
		.pipe(gulp.dest(config.log)) //将 rev-manifest.json 保存到 log 目录内
})

// 合并Utils
gulp.task('buildconcatUtilsJs', function() {
	return gulp.src(config.concat.utilsJS)
		.pipe(concat('utils.js'))
		.pipe(stripDebug())
		.pipe(babel({
			presets: ['@babel/env'],
			plugins: [],
		}))
		.pipe(uglify())
		.pipe(rev()) //文件名加MD5后缀
		.pipe(gulp.dest(config.concat.buildoutput))
		.pipe(rev.manifest('rev-concat-utilsjs-manifest-log.json')) //生成一个rev-manifest.json
		.pipe(gulp.dest(config.log)) //将 rev-manifest.json 保存到 rev 目录内


})
// 合并js
gulp.task('buildconcatCommonJS', function() {

	return gulp.src(config.concat.commonJS)
		.pipe(concat('common.js'))
		.pipe(stripDebug())
		.pipe(babel({
			presets: ['@babel/env'],
			plugins: [],
		}))
		.pipe(uglify())
		.pipe(rev()) //文件名加MD5后缀
		.pipe(gulp.dest(config.concat.buildoutput))
		.pipe(rev.manifest('rev-concat-commonjs-manifest-log.json')) //生成一个rev-manifest.json
		.pipe(gulp.dest(config.log)) //将 rev-manifest.json 保存到 rev 目录内
})

gulp.task('buildscss', function() {
	return gulp.src(config.enter.scss)
		.pipe(sass().on('error', sass.logError)) // sass编译
		.pipe(postcss([autoprefixer()])) // 添加前缀
		.pipe(cleanCSS()) // 压缩
		.pipe(rev()) //文件名加MD5后缀
		.pipe(gulp.dest(config.buildoutput))
		.pipe(rev.manifest('rev-css-manifest-log.json')) //生成一个rev-manifest.json
		.pipe(gulp.dest(config.log)) //将 rev-manifest.json 保存到 log 目录内

})


gulp.task('buildjs', function() {
	return gulp.src(config.enter.js)
		.pipe(stripDebug())
		.pipe(babel({
			presets: ['@babel/env'],
			plugins: [],
		}))
		.pipe(uglify()) // 压缩
		.pipe(rev()) //文件名加MD5后缀
		.pipe(gulp.dest(config.buildoutput))
		.pipe(rev.manifest('rev-js-manifest-log.json')) //生成一个rev-manifest.json
		.pipe(gulp.dest(config.log)) //将 rev-manifest.json 保存到 rev 目录内
})



gulp.task('buildhtml', function() {

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
	return gulp.src(config.enter.html)
		.pipe(fileinclude({
			prefix: '@@',
			basepath: 'src/static/include', //引用文件路径
		}))
		.pipe(htmlMin(options))
		.pipe(gulp.dest(config.buildoutput))
});

gulp.task('buildrevAll', function() {
	return gulp.src(['log/*.json', config.buildoutput + '/**/*.html'])
		.pipe(revCollector({ //替换html中对应的记录 
			replaceReved: true
		}))
		.pipe(gulp.dest(config.buildoutput)) //输出到该文件夹中  
})

gulp.task('build', gulp.series('removeDir', gulp.parallel('buildpipeLibs', 'buildconcatResetCss', 'buildconcatCommonScss',
	'buildconcatUtilsJs',
	'buildconcatCommonJS',
	'buildscss',
	'buildjs', 'buildhtml'), 'buildrevAll', done => done()))





// 传输所有未处理的文件
gulp.task('serverpipeLibs', function() {
	return gulp.src(['src/static/**', '!src/static/include/**'])
		.pipe(gulp.dest(config.serveroutput + '/static'))
		.pipe(reload({
			stream: true
		}));
})

// 合并CSS
gulp.task('serverconcatResetCss', function() {
	return gulp.src(config.concat.resetCss)
		.pipe(concat('reset.css'))
		.pipe(cleanCSS())
		.pipe(gulp.dest(config.concat.serveroutput))
		.pipe(reload({
			stream: true
		}));
})

// 合并SCSS
gulp.task('serverconcatCommonScss', function() {
	return gulp.src(config.concat.commonScss)
		.pipe(concat('common.scss'))
		.pipe(sass().on('error', sass.logError)) // sass编译
		.pipe(postcss([autoprefixer()])) // 添加前缀
		.pipe(cleanCSS())
		.pipe(gulp.dest(config.concat.serveroutput))
		.pipe(reload({
			stream: true
		}));
})

// 合并Utils
gulp.task('serverconcatUtilsJs', function() {
	return gulp.src(config.concat.utilsJS)
		.pipe(concat('utils.js'))
		.pipe(stripDebug())
		.pipe(babel({
			presets: ['@babel/env'],
			plugins: [],
		}))
		.pipe(uglify())
		.pipe(gulp.dest(config.concat.serveroutput))
		.pipe(reload({
			stream: true
		}));

})
// 合并js
gulp.task('serverconcatCommonJS', function() {

	return gulp.src(config.concat.commonJS)
		.pipe(concat('common.js'))
		.pipe(stripDebug())
		.pipe(babel({
			presets: ['@babel/env'],
			plugins: [],
		}))
		.pipe(uglify())
		.pipe(gulp.dest(config.concat.serveroutput))
		.pipe(reload({
			stream: true
		}));
})

gulp.task('serverscss', function() {
	return gulp.src(config.enter.scss)
		.pipe(sass().on('error', sass.logError)) // sass编译
		.pipe(postcss([autoprefixer()])) // 添加前缀
		.pipe(cleanCSS()) // 压缩
		.pipe(gulp.dest(config.serveroutput))
		.pipe(reload({
			stream: true
		}));
})

gulp.task('serverjs', function() {

	return gulp.src(config.enter.js)
		.pipe(babel({
			presets: ['@babel/env'],
			plugins: [],
		}))
		.pipe(uglify()) // 压缩
		.pipe(gulp.dest(config.serveroutput))
		.pipe(reload({
			stream: true
		}));
})



gulp.task('serverhtml', function() {

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
	return gulp.src(config.enter.html)
		.pipe(fileinclude({
			prefix: '@@',
			basepath: 'src/static/include',//引用文件路径
		}))
		.pipe(htmlMin(options))
		.pipe(gulp.dest(config.serveroutput))
		.pipe(reload({
			stream: true
		}));
});

gulp.task('browserSync', function() {
	browserSync({
		server: {
			baseDir: config.serveroutput
		},
		port: 8081
	});
	gulp.watch(['src/**'], gulp.parallel('serverpipeLibs', 'serverconcatResetCss', 'serverconcatCommonScss', 'serverconcatUtilsJs',
		'serverconcatCommonJS',
		'serverscss',
		'serverjs', 'serverhtml'))
})

gulp.task('serverpipeFile', gulp.parallel('serverpipeLibs', 'serverconcatResetCss', 'serverconcatCommonScss', 'serverconcatUtilsJs',
	'serverconcatCommonJS',
	'serverscss',
	'serverjs', 'serverhtml',
	function(done) {
		done();
	}))

gulp.task('server', gulp.series('serverpipeFile', 'browserSync',
	function(done) {
		done();
	}));

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
