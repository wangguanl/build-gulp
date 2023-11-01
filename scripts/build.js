/*
	create by Mr.Wang 2020/02/22
	* 功能说明
		1、此文件只用于打包， 开发环境请自行配置。
		2、解析SCSS为CSS并且压缩CSS
		3、ES6+的语法转换为ES5并且压缩JS
		4、压缩HTML、Image文件
		5、更多详情请看代码配置
		6、编译后根据文件内容生成对应Hash的版本号
	
	运行文件请先下载依赖模块：
	
	* 存在package.json文件
		$ npm install
	
	* 安装成功后出现node_modules，若想删除node_modules这个文件夹，可直接删除， 或下载rimraf模块
		1、$ npm|cnpm install -g rimraf  // 下载rimraf模块
		2、$ rimraf node_modules // 删除node_modules

	
	* 依赖模块安装成功后
		$ gulp 运行命令进行打包。

 */
// 引入依赖模块
const gulp = require('gulp'),
  concat = require('gulp-concat'),
  // 压缩html
  htmlMin = require('gulp-htmlmin'),
  fileInclude = require('gulp-file-include'),
  // 压缩css
  sass = require('gulp-dart-sass'),
  postcss = require('gulp-postcss'),
  autoprefixer = require('autoprefixer'),
  cleanCSS = require('gulp-clean-css'),
  // 压缩js
  uglify = require('gulp-uglify'),
  babel = require('gulp-babel'), // es6+转es5 需要配置规则（可生成.babelrc文件进行配置，也可在函数内配置。配置后请使用npm下载对应的插件）
  stripDebug = require('gulp-strip-debug'), // 清除 console.log
  // 压缩图片
  // tinypng = require('gulp-tinypng-compress'),

  // 对文件名加MD5后缀
  rev = require('gulp-rev'),
  revCollector = require('gulp-rev-collector'), //路径替换
  filter = require('gulp-filter'), // 筛选文件
  removeDir = require('./utils/removeDir'),
  Path = require('path'),
  commonConfig = require('./config/common');

/*
    文件路径配置
 */
const rootPath = Path.join(__dirname, '../');
const output = rootPath + '/dist/build';
const config = {
  ...commonConfig(output),
  log: rootPath + '/log', // 打包的日志文件
  rev: () => ['log/*.json', output + '/**/*.html'],
};

gulp.task('removeDir', done => {
  removeDir(config.output); // 先删除打包路径，再打包
  removeDir(config.log); // 先删除日志路径
  done();
});
// 传输所有未处理的文件
gulp.task('pipeLibs', () =>
  gulp.src(config.enter.libs).pipe(gulp.dest(config.output + '/static'))
);

gulp.task('pipeImages', () =>
  gulp
    .src(config.enter.images)
    .pipe(
      tinypng({
        key: '6Mf5s28SQC8yHydFMtSFcdpDFswd0ssd',
      })
    )
    .pipe(gulp.dest(config.output + '/static/images'))
);

// 合并CSS
gulp.task(
  'concatResetCss',
  () =>
    gulp
      .src(config.concat.resetCss)
      .pipe(concat('reset.css'))
      .pipe(cleanCSS())
      .pipe(rev()) //文件名加MD5后缀
      .pipe(gulp.dest(config.concat.output))
      .pipe(rev.manifest('rev-concat-css-manifest-log.json')) //生成一个rev-manifest.json
      .pipe(gulp.dest(config.log)) //将 rev-manifest.json 保存到 log 目录内
);

// 合并SCSS
gulp.task(
  'concatCommonScss',
  () =>
    gulp
      .src(config.concat.commonScss)
      .pipe(concat('common.scss'))
      .pipe(sass().on('error', sass.logError)) // sass编译
      .pipe(postcss([autoprefixer()])) // 添加前缀
      .pipe(cleanCSS())
      .pipe(rev()) //文件名加MD5后缀
      .pipe(gulp.dest(config.concat.output))
      .pipe(rev.manifest('rev-concat-scss-manifest-log.json')) //生成一个rev-manifest.json
      .pipe(gulp.dest(config.log)) //将 rev-manifest.json 保存到 log 目录内
);

// 合并Utils
gulp.task(
  'concatUtilsJs',
  () =>
    gulp
      .src(config.concat.utilsJS)
      // .pipe(concat('utils.js'))
      .pipe(stripDebug())
      .pipe(
        babel({
          presets: ['@babel/env'],
          plugins: [],
        })
      )
      .pipe(uglify())
      .pipe(rev()) //文件名加MD5后缀
      .pipe(gulp.dest(config.concat.output))
      .pipe(rev.manifest('rev-concat-utilsjs-manifest-log.json')) //生成一个rev-manifest.json
      .pipe(gulp.dest(config.log)) //将 rev-manifest.json 保存到 rev 目录内
);
// 合并js
gulp.task(
  'concatCommonJS',
  () =>
    gulp
      .src(config.concat.commonJS)
      .pipe(concat('common.js'))
      .pipe(stripDebug())
      .pipe(
        babel({
          presets: ['@babel/env'],
          plugins: [],
        })
      )
      .pipe(uglify())
      .pipe(rev()) //文件名加MD5后缀
      .pipe(gulp.dest(config.concat.output))
      .pipe(rev.manifest('rev-concat-commonjs-manifest-log.json')) //生成一个rev-manifest.json
      .pipe(gulp.dest(config.log)) //将 rev-manifest.json 保存到 rev 目录内
);

gulp.task(
  'scss',
  () =>
    gulp
      .src(config.enter.scss)
      .pipe(sass().on('error', sass.logError)) // sass编译
      .pipe(postcss([autoprefixer()])) // 添加前缀
      .pipe(cleanCSS()) // 压缩
      .pipe(rev()) //文件名加MD5后缀
      .pipe(gulp.dest(config.output))
      .pipe(rev.manifest('rev-css-manifest-log.json')) //生成一个rev-manifest.json
      .pipe(gulp.dest(config.log)) //将 rev-manifest.json 保存到 log 目录内
);

gulp.task(
  'js',
  () =>
    gulp
      .src(config.enter.js)
      .pipe(stripDebug())
      .pipe(
        babel({
          presets: ['@babel/env'],
          plugins: [],
        })
      )
      .pipe(uglify()) // 压缩
      .pipe(rev()) //文件名加MD5后缀
      .pipe(gulp.dest(config.output))
      .pipe(rev.manifest('rev-js-manifest-log.json')) //生成一个rev-manifest.json
      .pipe(gulp.dest(config.log)) //将 rev-manifest.json 保存到 rev 目录内
);

gulp.task(
  'html',
  (() => {
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
    return () =>
      gulp
        .src(config.enter.html)
        .pipe(
          fileInclude({
            prefix: '@@',
            basepath: 'src/static/include', //引用文件路径
          })
        )
        .pipe(htmlMin(options))
        .pipe(gulp.dest(config.output));
  })()
);

gulp.task('revAll', done => {
  gulp
    .src(config.rev())
    .pipe(
      revCollector({
        //替换html中对应的记录
        replaceReved: true,
      })
    )
    .pipe(gulp.dest(config.output)); //输出到该文件夹中 // 删除日志路径
  done();
});

module.exports = gulp.series(
  'removeDir',
  gulp.parallel(
    'pipeLibs',
    'concatResetCss',
    'concatCommonScss',
    'concatUtilsJs',
    'concatCommonJS',
    'scss',
    'js',
    'html'
  ),
  'revAll'
);
