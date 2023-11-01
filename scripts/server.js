/*
	create by Mr.Wang 2020/02/22
	* 功能说明
		1、此文件用于配置开发环境。
		2、解析SCSS为CSS
    3、修改文件后自动刷新页面
	运行文件请先下载依赖模块：
	
	* 存在package.json文件
		$ npm install
	
	* 安装成功后出现node_modules，若想删除node_modules这个文件夹，可直接删除， 或下载rimraf模块
		1、$ npm|cnpm install -g rimraf  // 下载rimraf模块
		2、$ rimraf node_modules // 删除node_modules

	
	* 依赖模块安装成功后
		$ gulp 运行命令进行打包。

 */

const gulp = require('gulp'),
  browserSync = require('browser-sync'),
  reload = browserSync.reload,
  concat = require('gulp-concat'),
  // htmlMin = require("gulp-htmlmin"),
  fileInclude = require('gulp-file-include'),
  // 压缩css
  sass = require('gulp-dart-sass'),
  removeDir = require('./utils/removeDir'),
  Path = require('path'),
  commonConfig = require('./config/common');
// postcss = require('gulp-postcss'),
// autoprefixer = require('autoprefixer'),
// cleanCSS = require('gulp-clean-css'),

// 压缩js
// uglify = require('gulp-uglify'),
// babel = require("gulp-babel"),
// stripDebug = require('gulp-strip-debug'); // 清除 console.log

/*
    文件路径配置
 */
const rootPath = Path.join(__dirname, '../');
const output = rootPath + '/dist/server';
const config = commonConfig(output);

gulp.task('removeDir', done => {
  removeDir(config.output); // 先删除打包路径，再打包
  done();
});
// 传输所有未处理的文件
gulp.task('pipeLibs', function () {
  return gulp
    .src(config.enter.libs)
    .pipe(gulp.dest(config.output + '/static'))
    .pipe(
      reload({
        stream: true,
      })
    );
});

// 合并CSS
gulp.task('concatResetCss', function () {
  return (
    gulp
      .src(config.concat.resetCss)
      .pipe(concat('reset.css'))
      // .pipe(cleanCSS())
      .pipe(gulp.dest(config.concat.output))
      .pipe(
        reload({
          stream: true,
        })
      )
  );
});

// 合并SCSS
gulp.task('concatCommonScss', function () {
  return (
    gulp
      .src(config.concat.commonScss)
      .pipe(concat('common.scss'))
      .pipe(sass().on('error', sass.logError)) // sass编译
      // .pipe(postcss([autoprefixer()])) // 添加前缀
      // .pipe(cleanCSS())
      .pipe(gulp.dest(config.concat.output))
      .pipe(
        reload({
          stream: true,
        })
      )
  );
});

// 合并Utils
gulp.task('concatUtilsJs', function () {
  return (
    gulp
      .src(config.concat.utilsJS)
      // .pipe(concat('utils.js'))
      // .pipe(stripDebug())
      /* .pipe(babel({
			presets: ['@babel/env'],
			plugins: [],
		})) */
      // .pipe(uglify())
      .pipe(gulp.dest(config.concat.output))
      .pipe(
        reload({
          stream: true,
        })
      )
  );
});
// 合并js
gulp.task('concatCommonJS', function () {
  return (
    gulp
      .src(config.concat.commonJS)
      .pipe(concat('common.js'))
      // .pipe(stripDebug())
      /* .pipe(babel({
			presets: ['@babel/env'],
			plugins: [],
		})) */
      // .pipe(uglify())
      .pipe(gulp.dest(config.concat.output))
      .pipe(
        reload({
          stream: true,
        })
      )
  );
});

gulp.task('scss', function () {
  return (
    gulp
      .src(config.enter.scss)
      .pipe(sass().on('error', sass.logError)) // sass编译
      // .pipe(postcss([autoprefixer()])) // 添加前缀
      // .pipe(cleanCSS()) // 压缩
      .pipe(gulp.dest(config.output))
      .pipe(
        reload({
          stream: true,
        })
      )
  );
});

gulp.task('js', function () {
  return (
    gulp
      .src(config.enter.js)
      /* .pipe(babel({
			presets: ['@babel/env'],
			plugins: [],
		})) */
      // .pipe(uglify()) // 压缩
      .pipe(gulp.dest(config.output))
      .pipe(
        reload({
          stream: true,
        })
      )
  );
});

gulp.task('html', function () {
  const options = {
    removeComments: true, //清除HTML注释
    collapseWhitespace: true, //压缩HTML
    collapseBooleanAttributes: true, //省略布尔属性的值 <input checked="true"/> ==> <input />
    removeEmptyAttributes: true, //删除所有空格作属性值 <input id="" /> ==> <input />
    removeScriptTypeAttributes: true, //删除<script>的type="text/javascript"
    removeStyleLinkTypeAttributes: true, //删除<style>和<link>的type="text/css"
    minifyJS: true, //压缩页面JS
    minifyCSS: true, //压缩页面CSS
  };
  return (
    gulp
      .src(config.enter.html)
      .pipe(
        fileInclude({
          prefix: '@@',
          basepath: 'src/static/include', //引用文件路径
        })
      )
      // .pipe(htmlMin(options))
      .pipe(gulp.dest(config.output))
      .pipe(
        reload({
          stream: true,
        })
      )
  );
});

gulp.task(
  'pipeFile',
  gulp.parallel(
    'pipeLibs',
    'concatResetCss',
    'concatCommonScss',
    'concatUtilsJs',
    'concatCommonJS',
    'scss',
    'js',
    'html'
  )
);
gulp.task('browserSync', function () {
  browserSync({
    server: {
      baseDir: config.output,
    },
    port: 8081,
  });
  gulp.watch(['src/**'], {}, gulp.series('pipeFile'));
});

module.exports = gulp.series('removeDir', 'pipeFile', 'browserSync');
