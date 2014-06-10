var gulp = require('gulp');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var exec = require('child_process').exec;
var reactify = require('reactify');

var reactifyES6 = function(file) {
    return reactify(file, {'es6': true});
};

gulp.task('makehs', function() {
    gulp.watch('*.hs', function(event) {
        console.error(event)
        console.error('fay --package fay-text,fay-dom ' + event.path);
        exec('fay --package fay-text,fay-dom ' + event.path);
    });
});

gulp.task('serve', function() {
    var bundler = watchify('./index.jsx');
    bundler.transform(reactifyES6);

    // rebundle every time index changes and leave some logspam
    bundler.on('log', console.error);
    bundler.on('update', rebundle);

    function rebundle () {
      return bundler.bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('./'))
    }

    return rebundle();
});

gulp.task('default', ['makehs', 'serve']);
