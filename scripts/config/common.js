module.exports = output => ({
  enter: {
    // 文件路径
    html: ['src/**/*.html', '!src/assets/**', '!src/static/**'],
    scss: ['src/**/*.scss', '!src/assets/**', '!src/static/**'],
    js: ['src/**/*.js', '!src/assets/**', '!src/static/**'],
    libs: ['src/static/**', '!src/static/include/**'],
    images: ['src/static/images/**'],
  },
  // 合并文件路径
  concat: {
    resetCss: ['src/assets/css/reset.css'],
    commonScss: ['src/assets/css/common.scss', 'src/assets/css/page.scss'],
    utilsJS: ['src/assets/utils/**'],
    commonJS: ['src/assets/js/**'],
    output: output + '/assets',
  },
  output, // 打包路径,
});
