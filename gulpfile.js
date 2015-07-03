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
var source = require('vinyl-source-stream');
var browserSync = require('browser-sync').create();
var del = require('del');

//specify relative path roots
var sourceRoot = 'public';
var buildRoot = 'public/build';

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

    var builder = browserify({
        entries: addBackslash(sourceRoot, 'modules/main.js'),
        debug: process.env.NODE_ENV === 'development',
        noparse: ['lodash']
    })
        .transform(babelify);


    var rebuildJs = function() {
        builder
            .bundle()
            .pipe(source('main.js'))
            .pipe(gulp.dest(destPaths.js));

        browserSync.reload();
    };

    //wrap for repeated rebuilding of only those parts that have changed
    if (watch) {
        builder = watchify(builder);
        builder.on('update', function() {
            console.log('rebuilding main.js');
            rebuildJs();
        });
    }

    rebuildJs();
};

gulp.task('build:js', function() {
    buildJs(false);
});

//rebuild and inject CSS into browser without reloading the app
gulp.task('build:css', function() {
    gulp.src(addBackslash(sourceRoot, ['sass/**/*.{scss,css}']))
        .pipe(sass({
            errLogToConsole: true
        }))
        .pipe(gulp.dest(buildRoot))
        .pipe(browserSync.stream())
});

gulp.task('build', ['build:js', 'build:css']);

gulp.task('reload', function() {
    browserSync.reload();
});

gulp.task('watch', function() {
    buildJs(true);
    gulp.watch(addBackslash(sourceRoot, 'sass/**/*.{scss,css}'), ['build:css']);
    gulp.watch(addBackslash(sourceRoot, '*.html'), browserSync.reload);
});

gulp.task('serve', function() {
    browserSync.init({
        proxy: "localhost:3000"
    });
});


gulp.task('default', ['clean', 'build', 'watch']);
gulp.task('bs', ['default', 'serve']);