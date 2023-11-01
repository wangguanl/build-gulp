var fs = require('fs');
var path = require('path');

//解析需要遍历的文件夹，获取相对路径
var filePath = path.join('./src');

//调用文件遍历方法
fileDisplay(filePath);

/**
 * 文件遍历方法
 * @param filePath 需要遍历的文件路径
 */
function fileDisplay(filePath) {
  //根据文件路径读取文件，返回文件列表
  fs.readdir(filePath, function (err, files) {
    if (err) {
      console.warn(err);
    } else {
      //遍历读取到的文件列表
      files.forEach(function (filename) {
        //获取当前文件的绝对路径
        var fileDir = path.join(filePath, filename);
        //根据文件路径获取文件信息，返回一个fs.Stats对象
        fs.stat(fileDir, function (error, stats) {
          if (error) {
            console.warn('获取文件stats失败');
          } else {
            var isFile = stats.isFile(); //是文件
            var isDir = stats.isDirectory(); //是文件夹

            if (isFile) {
              if (path.extname(fileDir) == '.html') {
                fs.readFile(
                  fileDir,
                  { flag: 'r+', encoding: 'utf8' },
                  function (err, data) {
                    // 获取到html页面中所有的script标签
                    var scripts = data.match(/<script.*?><\/script>/gi),
                      css = data.match(/<link(.*?)[^>]*>/gi);

                    // 创建一个html文件内容缓存区
                    var cache = data;

                    for (
                      var i = 0;
                      i <
                      (Object.prototype.toString.call(scripts) ==
                        '[object Array]' && scripts.length);
                      i++
                    ) {
                      let pathExt = '';
                      if (
                        Object.prototype.toString.call(
                          scripts[i].match(/<script .*?src=\"(.+?)\"/)
                        ) == '[object Array]'
                      ) {
                        pathExt = scripts[i].match(
                          /<script .*?src=\"(.+?)\"/
                        )[1];
                      } else {
                        continue;
                      }

                      // 是以 js || ./js || ../ 开头的相对路径 则替换路径为以根目录为相对路径
                      if (/^js\//g.test(pathExt)) {
                        cache = cache.replace(
                          new RegExp(pathExt),
                          (path
                            .dirname(fileDir)
                            .replace(/\\/g, '/')
                            .split('/')
                            .slice(1)
                            .join('/') &&
                            '/' +
                              path
                                .dirname(fileDir)
                                .replace(/\\/g, '/')
                                .split('/')
                                .slice(1)
                                .join('/')) +
                            '/' +
                            pathExt
                        );
                      } else if (/^\.\/js\//g.test(pathExt)) {
                        cache = cache.replace(
                          new RegExp(pathExt),
                          (path
                            .dirname(fileDir)
                            .replace(/\\/g, '/')
                            .split('/')
                            .slice(1)
                            .join('/') &&
                            '/' +
                              path
                                .dirname(fileDir)
                                .replace(/\\/g, '/')
                                .split('/')
                                .slice(1)
                                .join('/')) + pathExt.replace('./', '/')
                        );
                      } else if (/^\.\.\//g.test(pathExt)) {
                        cache = cache.replace(
                          new RegExp(pathExt),
                          pathExt.replace('../', '/')
                        );
                      }
                    }

                    for (
                      var i = 0;
                      i <
                      (Object.prototype.toString.call(css) ==
                        '[object Array]' && css.length);
                      i++
                    ) {
                      let pathExt = '';
                      if (
                        Object.prototype.toString.call(
                          css[i].match(/<link .*?href=\"(.+?)\"/)
                        ) == '[object Array]'
                      ) {
                        pathExt = css[i].match(/<link .*?href=\"(.+?)\"/)[1];
                      } else {
                        continue;
                      }
                      // 是以 css || ./css || ../ 开头的相对路径 则替换路径为以根目录为相对路径
                      if (/^css\//g.test(pathExt)) {
                        cache = cache.replace(
                          new RegExp(pathExt),
                          (path
                            .dirname(fileDir)
                            .replace(/\\/g, '/')
                            .split('/')
                            .slice(1)
                            .join('/') &&
                            '/' +
                              path
                                .dirname(fileDir)
                                .replace(/\\/g, '/')
                                .split('/')
                                .slice(1)
                                .join('/')) +
                            '/' +
                            pathExt
                        );
                      } else if (/^\.\/css\//g.test(pathExt)) {
                        cache = cache.replace(
                          new RegExp(pathExt),
                          (path
                            .dirname(fileDir)
                            .replace(/\\/g, '/')
                            .split('/')
                            .slice(1)
                            .join('/') &&
                            '/' +
                              path
                                .dirname(fileDir)
                                .replace(/\\/g, '/')
                                .split('/')
                                .slice(1)
                                .join('/')) + pathExt.replace('./', '/')
                        );
                      } else if (/^\.\.\//g.test(pathExt)) {
                        cache = cache.replace(
                          new RegExp(pathExt),
                          pathExt.replace('../', '/')
                        );
                      }
                    }

                    fs.writeFile(fileDir, cache, function (err) {
                      if (err) {
                        console.log(err);
                        return;
                      } else {
                        // options.callback && options.callback()
                      }
                    });
                  }
                );
              }

              /* if (path.extname(fileDir) == '.html') {
                fs.readFile(
                  fileDir,
                  { flag: 'r+', encoding: 'utf8' },
                  function (err, data) {
                    // 写入js-log文件
                    fs.writeFile(
                      'js.json',
                      `"${fileDir.replace(/\\/g, '/')}": ${data.match(
                        /<script.*?>.*?<\/script>/gi
                      )}\n\n`,
                      { flag: 'a' },
                      function (err) {
                        if (err) {
                          console.log(err);
                          return;
                        } else {
                          // options.callback && options.callback()
                        }
                      }
                    );

                    // 写入css-log文件
                    fs.writeFile(
                      'css.json',
                      `"${fileDir.replace(/\\/g, '/')}": ${data.match(
                        /<link(.*?)[^>]*>/gi
                      )}\n\n`,
                      { flag: 'a' },
                      function (err) {
                        if (err) {
                          console.log(err);
                          return;
                        } else {
                          // options.callback && options.callback()
                        }
                      }
                    );
                  }
                );
              }

              if (
                path.extname(fileDir) == '.css' ||
                path.extname(fileDir) == '.js'
              ) {
                fs.writeFile(
                  'log.json',
                  fileDir + '\n',
                  { flag: 'a' },
                  function (err) {
                    if (err) {
                      console.log(err);
                      return;
                    } else {
                      // options.callback && options.callback()
                    }
                  }
                );
              } */
            }
            if (isDir) {
              fileDisplay(fileDir); //递归，如果是文件夹，就继续遍历该文件夹下面的文件
            }
          }
        });
      });
    }
  });
}

function changeFile(options) {
  fs.readFile(
    options.pointFile,
    { flag: 'r+', encoding: 'utf8' },
    function (err, data) {
      if (err) {
        console.error(err);
        return;
      }
      var type = {
        js: new Buffer(
          data.replace(
            /<script.*?>.*?<\/script>/gi,
            '<script src="' +
              options.pointFile.replace(/\\/g, '/') +
              '"></script>'
          )
        ),
        css: new Buffer(data.replace(/[a-zA-Z0-9]{0,}\/css\//g, 'css/')),
      };
      fs.writeFile(options.newFile, type['js'], { flag: 'a' }, function (err) {
        if (err) {
          console.log(err);
          return;
        } else {
          options.callback && options.callback();
        }
      });
    }
  );
}
