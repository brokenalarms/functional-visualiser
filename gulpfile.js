'use strict';
var gulp = require('gulp');
var babel = require('gulp-babel');
var del = require('del');

//folder setup
var frontendFolder = 'public';
var backendFolder = '';
var destinationFolder = '../build';

var sourcePaths = {
    frontend: {
        js: [frontendFolder + '/**/*.js']
    },
    backend: {
        js: [backendFolder + '/**/*.js']
    }
};

var destinationPaths = {
    frontend: {
        js: destinationFolder + '/' + frontendFolder
    },
    backend: {
        js: destinationFolder + (backendFolder !== '') ? ('/' + backendFolder) : ''
    }
};

//tasks
gulp.task('clean', function() {
    del([destinationFolder+'/**/*']);
});

gulp.task('build:frontend:js', function() {
    return gulp.src(sourcePaths.frontend.js)
        .pipe(babel())
        .pipe(gulp.dest(destinationPaths.frontend.js));
});

gulp.task('build:backend:js', function() {
    return gulp.src(sourcePaths.backend.js)
        .pipe(babel())
        .pipe(gulp.dest(destinationPaths.backend.js));
});

gulp.task('build', ['build:frontend:js', 'build:backend:js']);

gulp.task('watch', function() {
    gulp.watch('*/**/*.js', ['build'])
});


gulp.task('default', ['clean', 'build', 'watch']);