const gulp = require('gulp');
const build = require('./scripts/build');
const server = require('./scripts/server');
gulp.task('build', build);
gulp.task('server', server);
