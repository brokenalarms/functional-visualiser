//=========================================
// gulpfile.js:
// sets up the automated build pipeline to:
// - transpile frontend JS from ES6 to ES5 for browser consumption
// - convert SASS-syntax CSS to base CSS
// - concatenates and minifies CSS and JS to a single file for
//   most efficient serving
// - auto reloads browser on server changes
//=========================================


'use strict';
var gulp = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify');
var watchify = require('watchify');
var sass = require('gulp-sass');
var nodemon = require('gulp-nodemon');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync').create();
var del = require('del');
var globbing = require('gulp-css-globbing');

//specify relative path roots
var sourceRoot = './public';
var buildRoot = './public/build';

//setup Gulp globs from path roots
var addBackslash = function(first, second) {
  if (!first || first == '') {
    return second
  } else if (!second || first == '') {
    return first
  } else {
    return first + '/' + second;
  }
};

var jsPath = addBackslash(sourceRoot, '**/*.js');

var sourcePaths = {
  js: jsPath
};

var destPaths = {
  js: buildRoot
};

//tasks
gulp.task('clean', function() {
  del([buildRoot + '/**/*']);
});


var buildJs = function(watch) {

  //all the dependencies we don't want to watch (faster dev refresh)
  var libs = [
    'react',
    'd3',
    'webcola',
    'material-ui',
    'react-tap-event-plugin',
    'lodash',
    'acorn',
    'estraverse',
    'escodegen',
    'brace',
    'react-remarkable',
    'uuid-js',
  ];

  var vendorBundler = browserify({
    debug: true,
  })
  libs.forEach(function(lib) {
    if(lib !== 'cola'){
    vendorBundler.require(lib);
  }
  })

  var bundler = browserify({
      debug: true,
      cache: {},
      packageCache: {},
      fullPaths: watch
    })
    .require(require.resolve('./public/index.jsx'), {
      entry: true
    })
    .transform(babelify.configure({
      stage: 0,
    }))
  libs.forEach(function(lib) {
    bundler.external(lib);
  });

  var rebundle = function() {
    var startTime = Date.now();
    console.log('rebuilding user js');
    return bundler.bundle()
      .pipe(source('index.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({
        loadMaps: true
      }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(destPaths.js))
      .on('error', function(err) {
        console.error(err.message || err);
        this.emit('end');
      })
      .on('end', function() {
        console.log('js rebuilt in ' + (Date.now() - startTime) + ' ms');
        browserSync.reload();
      });
  };

  if (watch) {
    bundler = watchify(bundler);
    bundler.on('update', rebundle);
  }

  vendorBundler.bundle()
    .pipe(source('vendor.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(destPaths.js));

  return rebundle();
};

gulp.task('build:js', function() {
  buildJs(false);
});

//rebuild and inject CSS into browser without reloading the app
gulp.task('build:css', function() {
  console.log('rebuilding css...');
  gulp.src(addBackslash(sourceRoot, ['sass/**/*.{scss,css}']))
    .pipe(globbing({
      extensions: ['.scss']
    }))
    .pipe(sass({
      errLogToConsole: true
    }))
    .on('error', function(err) {
      console.error(err);
      this.emit('end');
    })
    .pipe(gulp.dest(buildRoot))
    .pipe(browserSync.stream());
});

gulp.task('build', ['build:js', 'build:css']);

gulp.task('watch', function() {
  buildJs(true);
  gulp.watch([addBackslash(sourceRoot, 'sass/**/*.{scss,css}'), addBackslash(sourceRoot, 'reactComponents/**/*.{scss,css}')], ['build:css']);
  gulp.watch(addBackslash(sourceRoot, '*.html'), function() {
    console.log('html changed, reloading...');
    browserSync.reload();
  });
});

gulp.task('syncBrowser', ['default'], function() {
  browserSync.init({
    port: '4000',
    snippetOptions: {
      async: false
    },
    proxy: 'localhost:3000'
  });
});

gulp.task('serve', function() {
  nodemon({
      script: 'bin/www.js',
      ext: 'js html',
      ignore: ['public', 'node_modules'],
      env: {
        'NODE_ENV': 'development'
      },
      tasks: null
    })
    .on('restart', function() {

    })
});


gulp.task('default', ['clean', 'build:css', 'watch']);
gulp.task('bs', ['default', 'syncBrowser']);
gulp.task('all', ['serve', 'bs']);
