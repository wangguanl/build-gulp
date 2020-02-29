const gulp = require('gulp'),
	browserSync = require('browser-sync'),
	reload = browserSync.reload,
	concat = require('gulp-concat'),
	htmlMin = require("gulp-htmlmin"),
	fileinclude = require('gulp-file-include'),

	// 压缩css
	sass = require('gulp-dart-sass'),
	postcss = require('gulp-postcss'),
	autoprefixer = require('autoprefixer'),
	cleanCSS = require('gulp-clean-css'),

	// 压缩js
	uglify = require('gulp-uglify'),
	babel = require("gulp-babel"),
	stripDebug = require('gulp-strip-debug'); // 清除 console.log


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
		output: __dirname + '/server/assets'
	},
	output: __dirname + '/server', // 打包路径,
}




// 传输所有未处理的文件
gulp.task('pipeLibs', function() {
	return gulp.src(['src/static/**', '!src/static/include/**'])
		.pipe(gulp.dest(config.output + '/static'))
		.pipe(reload({
			stream: true
		}));
})

// 合并CSS
gulp.task('concatResetCss', function() {
	return gulp.src(config.concat.resetCss)
		.pipe(concat('reset.css'))
		.pipe(cleanCSS())
		.pipe(gulp.dest(config.concat.output))
		.pipe(reload({
			stream: true
		}));
})

// 合并SCSS
gulp.task('concatCommonScss', function() {
	return gulp.src(config.concat.commonScss)
		.pipe(concat('common.scss'))
		.pipe(sass().on('error', sass.logError)) // sass编译
		.pipe(postcss([autoprefixer()])) // 添加前缀
		.pipe(cleanCSS())
		.pipe(gulp.dest(config.concat.output))
		.pipe(reload({
			stream: true
		}));
})

// 合并Utils
gulp.task('concatUtilsJs', function() {
	return gulp.src(config.concat.utilsJS)
		.pipe(concat('utils.js'))
		.pipe(stripDebug())
		.pipe(babel({
			presets: ['@babel/env'],
			plugins: [],
		}))
		.pipe(uglify())
		.pipe(gulp.dest(config.concat.output))
		.pipe(reload({
			stream: true
		}));

})
// 合并js
gulp.task('concatCommonJS', function() {

	return gulp.src(config.concat.commonJS)
		.pipe(concat('common.js'))
		.pipe(stripDebug())
		.pipe(babel({
			presets: ['@babel/env'],
			plugins: [],
		}))
		.pipe(uglify())
		.pipe(gulp.dest(config.concat.output))
		.pipe(reload({
			stream: true
		}));
})

gulp.task('scss', function() {
	return gulp.src(config.enter.scss)
		.pipe(sass().on('error', sass.logError)) // sass编译
		.pipe(postcss([autoprefixer()])) // 添加前缀
		.pipe(cleanCSS()) // 压缩
		.pipe(gulp.dest(config.output))
		.pipe(reload({
			stream: true
		}));
})

gulp.task('js', function() {

	return gulp.src(config.enter.js)
		.pipe(babel({
			presets: ['@babel/env'],
			plugins: [],
		}))
		.pipe(uglify()) // 压缩
		.pipe(gulp.dest(config.output))
		.pipe(reload({
			stream: true
		}));
})



gulp.task('html', function() {

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
		.pipe(gulp.dest(config.output))
		.pipe(reload({
			stream: true
		}));
});

gulp.task('browserSync', function() {
	browserSync({
		server: {
			baseDir: config.output
		},
		port: 8081
	});
	gulp.watch(['src/**'], gulp.parallel('pipeLibs', 'concatResetCss', 'concatCommonScss', 'concatUtilsJs',
		'concatCommonJS',
		'scss',
		'js', 'html'))
})

gulp.task('pipeFile', gulp.parallel('pipeLibs', 'concatResetCss', 'concatCommonScss', 'concatUtilsJs',
	'concatCommonJS',
	'scss',
	'js', 'html',
	function(done) {
		done();
	}))

gulp.task('default', gulp.series('pipeFile', 'browserSync',
	function(done) {
		done();
	}));
